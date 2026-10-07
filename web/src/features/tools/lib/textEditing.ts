import type { Point } from "@/shared/canvas";
import {
  hitTestScene,
  sceneApi,
  useSceneStore,
  type Scene,
} from "@/entities/scene";
import { useToolStore } from "../model/toolStore";

const HIT_TOLERANCE_PX = 6;
export const DEFAULT_FONT_SIZE = 20;

type TextApi = Pick<typeof sceneApi, "add" | "update" | "remove">;

let sessionCounter = 0;

function openEditor(init: {
  id: string | null;
  x: number;
  y: number;
  fontSize: number;
  initialText: string;
}): void {
  useToolStore
    .getState()
    .setTextEditor({
      ...init,
      session: ++sessionCounter,
      text: init.initialText,
    });
}

export function beginTextEditing(
  point: Point,
  zoom: number,
  { createOverShapes }: { createOverShapes: boolean },
  getScene: () => Scene = () => useSceneStore.getState().scene,
  api: TextApi = sceneApi,
): boolean {
  if (useToolStore.getState().textEditor) commitTextEditor({}, api);

  const hit = hitTestScene(getScene(), point, HIT_TOLERANCE_PX / zoom);

  if (hit?.type === "text") {
    openEditor({
      id: hit.id,
      x: hit.x,
      y: hit.y,
      fontSize: hit.fontSize,
      initialText: hit.text,
    });
    return true;
  }
  if (hit && !createOverShapes) return false;

  openEditor({
    id: null,
    x: point.x,
    y: point.y,
    fontSize: DEFAULT_FONT_SIZE,
    initialText: "",
  });
  return true;
}

function selectOnly(id: string): void {
  const store = useToolStore.getState();
  store.setActiveTool("select");
  store.setSelection([id]);
  store.setCursor(null);
}

export function commitTextEditor(
  { select = false }: { select?: boolean } = {},
  api: TextApi = sceneApi,
): void {
  const { textEditor: editor, setTextEditor } = useToolStore.getState();
  if (!editor) return;
  setTextEditor(null);

  const text = editor.text.trimEnd();
  const isEmpty = text.trim() === "";

  if (editor.id === null) {
    if (isEmpty) return;
    const id = api.add({
      type: "text",
      x: editor.x,
      y: editor.y,
      text,
      fontSize: editor.fontSize,
    });
    if (select) selectOnly(id);
    return;
  }

  if (isEmpty) {
    api.remove(editor.id);
    return;
  }
  if (text !== editor.initialText) api.update(editor.id, { text });
  if (select) selectOnly(editor.id);
}
