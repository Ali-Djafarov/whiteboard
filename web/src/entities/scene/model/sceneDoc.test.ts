import * as Y from "yjs";
import { describe, expect, it } from "vitest";
import { createSceneDoc, type NewElement } from "./sceneDoc";

const rect: NewElement = {
  type: "rectangle",
  x: 100,
  y: 50,
  width: 200,
  height: 100,
};
const arrow: NewElement = {
  type: "arrow",
  start: { x: 0, y: 0 },
  end: { x: 100, y: 50 },
};
const stroke: NewElement = {
  type: "free-draw",
  x: 10,
  y: 20,
  points: [
    { x: 0, y: 0 },
    { x: 5, y: 5 },
  ],
};

function sync(a: Y.Doc, b: Y.Doc) {
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a));
  Y.applyUpdate(a, Y.encodeStateAsUpdate(b));
}

const ids = (scene: ReturnType<typeof createSceneDoc>) =>
  scene.snapshot().elements.map((e) => e.id);

describe("sceneDoc", () => {
  describe("add", () => {
    it("adds an element and returns its id", () => {
      const scene = createSceneDoc();
      const id = scene.add(rect);

      expect(scene.snapshot().elements).toEqual([{ ...rect, id, z: 1 }]);
    });

    it("assigns increasing z, so later elements are on top", () => {
      const scene = createSceneDoc();
      const first = scene.add(rect);
      const second = scene.add(rect);

      expect(ids(scene)).toEqual([first, second]);
    });

    it("stores arrow and free-draw without losing data", () => {
      const scene = createSceneDoc();
      const arrowId = scene.add(arrow);
      const strokeId = scene.add(stroke);

      expect(scene.snapshot().elements).toEqual([
        { ...arrow, id: arrowId, z: 1 },
        { ...stroke, id: strokeId, z: 2 },
      ]);
    });
  });

  describe("update", () => {
    it("updates only the given fields", () => {
      const scene = createSceneDoc();
      const id = scene.add(rect);

      scene.update(id, { x: 300, y: 200 });

      expect(scene.snapshot().elements[0]).toMatchObject({
        ...rect,
        x: 300,
        y: 200,
      });
    });

    it("ignores unknown ids", () => {
      const scene = createSceneDoc();
      scene.add(rect);

      expect(() => scene.update("missing", { x: 1 })).not.toThrow();
      expect(scene.snapshot().elements).toHaveLength(1);
    });
  });

  describe("remove", () => {
    it("removes an element by id", () => {
      const scene = createSceneDoc();
      const id = scene.add(rect);

      scene.remove(id);

      expect(scene.snapshot().elements).toHaveLength(0);
    });
  });

  describe("removeMany", () => {
    it("removes several elements and keeps the rest", () => {
      const scene = createSceneDoc();
      const first = scene.add(rect);
      const second = scene.add(rect);
      const third = scene.add(rect);

      scene.removeMany([first, third]);

      expect(ids(scene)).toEqual([second]);
    });

    it("notifies subscribers once for the whole batch", () => {
      const scene = createSceneDoc();
      const first = scene.add(rect);
      const second = scene.add(rect);
      scene.add(rect);

      let calls = 0;
      scene.subscribe(() => calls++);

      scene.removeMany([first, second]);

      expect(calls).toBe(1);
    });

    it("ignores unknown ids and an empty list", () => {
      const scene = createSceneDoc();
      scene.add(rect);

      expect(() => scene.removeMany(["missing"])).not.toThrow();
      expect(() => scene.removeMany([])).not.toThrow();
      expect(scene.snapshot().elements).toHaveLength(1);
    });
  });

  describe("subscribe", () => {
    it("notifies once per transaction and stops after unsubscribe", () => {
      const scene = createSceneDoc();
      const id = scene.add(rect);
      let calls = 0;
      const unsubscribe = scene.subscribe(() => calls++);

      scene.update(id, { x: 1, y: 2, width: 3, height: 4 });
      expect(calls).toBe(1);

      unsubscribe();
      scene.update(id, { x: 5 });
      expect(calls).toBe(1);
    });
  });

  describe("concurrent edits", () => {
    it("merges changes to different fields of one element", () => {
      const a = createSceneDoc();
      const b = createSceneDoc();
      const id = a.add(rect);
      sync(a.doc, b.doc);

      a.update(id, { x: 10 });
      b.update(id, { width: 300 });
      sync(a.doc, b.doc);

      for (const scene of [a, b]) {
        expect(scene.snapshot().elements[0]).toMatchObject({
          x: 10,
          width: 300,
        });
      }
    });

    it("merges changes to arrow start and end", () => {
      const a = createSceneDoc();
      const b = createSceneDoc();
      const id = a.add(arrow);
      sync(a.doc, b.doc);

      a.update(id, { start: { x: 1, y: 1 } });
      b.update(id, { end: { x: 9, y: 9 } });
      sync(a.doc, b.doc);

      for (const scene of [a, b]) {
        expect(scene.snapshot().elements[0]).toMatchObject({
          start: { x: 1, y: 1 },
          end: { x: 9, y: 9 },
        });
      }
    });

    it("orders concurrently added elements identically on both replicas", () => {
      const a = createSceneDoc();
      const b = createSceneDoc();
      a.add(rect);
      b.add(rect);
      sync(a.doc, b.doc);

      expect(ids(a)).toEqual(ids(b));
      expect(ids(a)).toHaveLength(2);
    });
  });

  describe("validation of remote data", () => {
    const elementsOf = (scene: ReturnType<typeof createSceneDoc>) =>
      scene.doc.getMap<Y.Map<unknown>>("elements");

    it("skips elements with unknown type", () => {
      const scene = createSceneDoc();
      elementsOf(scene).set(
        "bad",
        new Y.Map<unknown>([
          ["type", "banana"],
          ["z", 1],
        ]),
      );

      expect(scene.snapshot().elements).toHaveLength(0);
    });

    it("skips an arrow with a malformed point", () => {
      const scene = createSceneDoc();
      elementsOf(scene).set(
        "bad",
        new Y.Map<unknown>([
          ["type", "arrow"],
          ["z", 1],
          ["start", { x: "oops", y: 0 }],
          ["end", { x: 1, y: 1 }],
        ]),
      );

      expect(scene.snapshot().elements).toHaveLength(0);
    });
  });
});
