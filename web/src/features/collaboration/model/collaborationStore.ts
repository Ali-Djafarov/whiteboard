import { create } from "zustand";

import type { Point } from "@/shared/canvas";

export type RemoteCursor = {
  clientId: number;
  name: string;
  color: string;
  point: Point;
};

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

type CollaborationState = {
  cursors: RemoteCursor[];
  status: ConnectionStatus;
  setCursors: (cursors: RemoteCursor[]) => void;
  setStatus: (status: ConnectionStatus) => void;
};

export const useCollaborationStore = create<CollaborationState>((set) => ({
  cursors: [],
  status: "connecting",
  setCursors: (cursors) => set({ cursors }),
  setStatus: (status) => set({ status }),
}));
