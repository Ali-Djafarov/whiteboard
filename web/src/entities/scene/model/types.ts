import type { Point } from "@/shared/canvas";

type ElementBase = { id: string; z: number };

type BoxBase = ElementBase & {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type RectangleElement = BoxBase & { type: "rectangle" };

export type EllipseElement = BoxBase & { type: "ellipse" };

export type ArrowElement = ElementBase & {
  type: "arrow";
  start: Point;
  end: Point;
};

export type TextElement = ElementBase & {
  type: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
};

export type FreeDrawElement = ElementBase & {
  type: "free-draw";
  x: number;
  y: number;
  points: Point[];
};

export type SceneElement =
  | RectangleElement
  | EllipseElement
  | ArrowElement
  | TextElement
  | FreeDrawElement;

export type Scene = { elements: SceneElement[] };
