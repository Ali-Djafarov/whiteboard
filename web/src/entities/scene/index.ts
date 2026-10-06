export { renderScene } from "./lib/renderScene";
export type { RenderOverlay } from "./lib/renderScene";
export { getBounds, getSelectionBounds } from "./lib/bounds";
export { getMovePatch } from "./lib/getMovePatch";
export { hitTestScene, hitTestElement, elementsInRect } from "./lib/hitTest";
export type { HitMode } from "./lib/hitTest";
export { resolvePressTarget } from "./lib/pressTarget";
export type { PressTarget } from "./lib/pressTarget";
export {
  hitTestHandle,
  hitTestArrowHandle,
  getHandlePoints,
  resizeRect,
  HANDLE_IDS,
} from "./lib/handles";
export type { HandleId, ArrowEnd } from "./lib/handles";
export { applyPatch } from "./lib/patch";
export type { ElementPatch, NewElement } from "./model/sceneDoc";
export { sceneApi, useSceneStore } from "./model/sceneStore";
export { LOCAL_ORIGIN } from "./model/sceneDoc";
export type { ArrowElement, Scene, SceneElement } from "./model/types";
export { rectTransform, scaleElementPatch } from "./lib/scale";
