import { describe, expect, it } from "vitest";

import { addElement } from "./add-element";
import { updateElement } from "./update-element";
import { removeElement } from "./remove-element";

import type { Rectangle, Scene } from "../model/types";

describe("scene", () => {
  const rectangle: Rectangle = {
    id: "rect-1",
    type: "rectangle",
    x: 100,
    y: 50,
    width: 200,
    height: 100,
  };

  const scene: Scene = {
    elements: [],
  };

  describe("addElement", () => {
    it("добавляет элемент в Scene", () => {
      const newScene = addElement(scene, rectangle);

      expect(newScene.elements).toHaveLength(1);
      expect(newScene.elements[0]).toEqual(rectangle);
    });

    it("не изменяет исходный Scene", () => {
      addElement(scene, rectangle);

      expect(scene.elements).toHaveLength(0);
    });
  });

  describe("updateElement", () => {
    it("обновляет элемент по id", () => {
      const sceneWithElement = addElement(scene, rectangle);

      const newScene = updateElement(sceneWithElement, "rect-1", {
        x: 300,
        y: 200,
      });

      expect(newScene.elements[0]).toEqual({
        ...rectangle,
        x: 300,
        y: 200,
      });
    });

    it("не изменяет исходный Scene", () => {
      const sceneWithElement = addElement(scene, rectangle);

      updateElement(sceneWithElement, "rect-1", {
        x: 300,
      });

      expect(sceneWithElement.elements[0]).toEqual(rectangle);
    });
  });

  describe("removeElement", () => {
    it("удаляет элемент по id", () => {
      const sceneWithElement = addElement(scene, rectangle);

      const newScene = removeElement(sceneWithElement, "rect-1");

      expect(newScene.elements).toHaveLength(0);
    });

    it("не изменяет исходный Scene", () => {
      const sceneWithElement = addElement(scene, rectangle);

      removeElement(sceneWithElement, "rect-1");

      expect(sceneWithElement.elements).toHaveLength(1);
    });
  });
});
