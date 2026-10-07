import { create } from "zustand";
import { sceneApi } from "./sceneStore";

type HistoryState = { canUndo: boolean; canRedo: boolean };

const read = (): HistoryState => ({
  canUndo: sceneApi.canUndo(),
  canRedo: sceneApi.canRedo(),
});

export const useHistoryStore = create<HistoryState>(read);

sceneApi.subscribeHistory(() => useHistoryStore.setState(read()));
