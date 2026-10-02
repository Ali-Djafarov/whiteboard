export type Point = {
  x: number;
  y: number;
};

export type Rectangle = {
  id: string;
  type: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Ellipse = {
  id: string;
  type: "ellipse";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Arrow = {
  id: string;
  type: "arrow";
  start: Point;
  end: Point;
};

export type Text = {
  id: string;
  type: "text";
  x: number;
  y: number;
  text: string;
};

export type FreeDraw = {
  id: string;
  type: "free-draw";
  points: Point[];
};

export type SceneElement = Rectangle | Ellipse | Arrow | Text | FreeDraw;

export type Scene = {
  elements: SceneElement[];
};
