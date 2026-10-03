import { create } from "zustand";
import { createSceneDoc } from "./sceneDoc";
import type { Scene } from "./types";

export const sceneApi = createSceneDoc();

export const useSceneStore = create<{ scene: Scene }>(() => ({
  scene: sceneApi.snapshot(),
}));

sceneApi.subscribe(() =>
  useSceneStore.setState({ scene: sceneApi.snapshot() }),
);
