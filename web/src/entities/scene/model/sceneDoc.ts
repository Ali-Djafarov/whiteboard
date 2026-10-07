import * as Y from "yjs";
import type { Scene, SceneElement } from "./types";
import type { Point } from "@/shared/canvas";

export const LOCAL_ORIGIN = Symbol("local");

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;
type DistributivePatch<T> = T extends unknown
  ? Partial<Omit<T, "id" | "type" | "z">>
  : never;

export type NewElement = DistributiveOmit<SceneElement, "id" | "z">;
export type ElementPatch = DistributivePatch<SceneElement>;

const isNum = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const isPoint = (v: unknown): v is Point =>
  typeof v === "object" &&
  v !== null &&
  isNum((v as Point).x) &&
  isNum((v as Point).y);

const isPointArray = (v: unknown): v is Point[] =>
  Array.isArray(v) && v.every(isPoint);

function readElement(id: string, map: Y.Map<unknown>): SceneElement | null {
  const type = map.get("type");
  const z = map.get("z");
  if (!isNum(z)) return null;

  switch (type) {
    case "rectangle":
    case "ellipse": {
      const x = map.get("x");
      const y = map.get("y");
      const width = map.get("width");
      const height = map.get("height");
      if (!isNum(x) || !isNum(y) || !isNum(width) || !isNum(height))
        return null;
      return { id, type, z, x, y, width, height };
    }
    case "arrow": {
      const start = map.get("start");
      const end = map.get("end");
      if (!isPoint(start) || !isPoint(end)) return null;
      return { id, type, z, start, end };
    }
    case "text": {
      const x = map.get("x");
      const y = map.get("y");
      const text = map.get("text");
      const fontSize = map.get("fontSize");
      if (
        !isNum(x) ||
        !isNum(y) ||
        typeof text !== "string" ||
        !isNum(fontSize)
      )
        return null;
      return { id, type, z, x, y, text, fontSize };
    }
    case "free-draw": {
      const x = map.get("x");
      const y = map.get("y");
      const points = map.get("points");
      if (!isNum(x) || !isNum(y) || !isPointArray(points)) return null;
      return { id, type, z, x, y, points };
    }
    default:
      return null;
  }
}

export function createSceneDoc(doc: Y.Doc = new Y.Doc()) {
  const elements = doc.getMap<Y.Map<unknown>>("elements");

  const undoManager = new Y.UndoManager(elements, {
    trackedOrigins: new Set([LOCAL_ORIGIN]),
    captureTimeout: 0,
  });

  function undo(): boolean {
    return undoManager.undo() !== null;
  }

  function redo(): boolean {
    return undoManager.redo() !== null;
  }

  function subscribeHistory(listener: () => void): () => void {
    undoManager.on("stack-item-added", listener);
    undoManager.on("stack-item-popped", listener);
    undoManager.on("stack-cleared", listener);
    return () => {
      undoManager.off("stack-item-added", listener);
      undoManager.off("stack-item-popped", listener);
      undoManager.off("stack-cleared", listener);
    };
  }

  function snapshot(): Scene {
    const list: SceneElement[] = [];
    elements.forEach((map, id) => {
      const element = readElement(id, map);
      if (element) {
        list.push(element);
      } else if (import.meta.env.DEV) {
        console.warn(`[scene] skipped invalid element "${id}"`);
      }
    });
    list.sort((a, b) => a.z - b.z || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    return { elements: list };
  }

  function add(input: NewElement): string {
    const id = crypto.randomUUID();
    doc.transact(() => {
      let maxZ = 0;
      elements.forEach((map) => {
        const z = map.get("z");
        if (isNum(z) && z > maxZ) maxZ = z;
      });
      elements.set(id, new Y.Map(Object.entries({ ...input, z: maxZ + 1 })));
    }, LOCAL_ORIGIN);
    return id;
  }

  function updateMany(patches: Readonly<Record<string, ElementPatch>>): void {
    doc.transact(() => {
      for (const [id, patch] of Object.entries(patches)) {
        const map = elements.get(id);
        if (!map) continue;
        for (const [key, value] of Object.entries(patch)) {
          if (value !== undefined && map.get(key) !== value)
            map.set(key, value);
        }
      }
    }, LOCAL_ORIGIN);
  }

  function update(id: string, patch: ElementPatch): void {
    updateMany({ [id]: patch });
  }

  function remove(id: string): void {
    doc.transact(() => elements.delete(id), LOCAL_ORIGIN);
  }

  function removeMany(ids: readonly string[]): void {
    doc.transact(() => {
      for (const id of ids) elements.delete(id);
    }, LOCAL_ORIGIN);
  }

  function subscribe(listener: () => void): () => void {
    elements.observeDeep(listener);
    return () => elements.unobserveDeep(listener);
  }

  return {
    doc,
    snapshot,
    add,
    update,
    updateMany,
    remove,
    removeMany,
    subscribe,
    undo,
    redo,
    canUndo: () => undoManager.canUndo(),
    canRedo: () => undoManager.canRedo(),
    subscribeHistory,
    clearHistory: () => undoManager.clear(),
  };
}
