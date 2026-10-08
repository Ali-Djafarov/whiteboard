import type * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import type { Point } from "@/shared/canvas";
import {
  useCollaborationStore,
  type ConnectionStatus,
  type RemoteCursor,
} from "../model/collaborationStore";
import { getLocalUser } from "./localUser";
import { parseRemoteCursor } from "./peers";

export type Collaboration = {
  setCursor: (point: Point | null) => void;
  destroy: () => void;
};

export function createCollaboration({
  doc,
  url,
  room,
}: {
  doc: Y.Doc;
  url: string;
  room: string;
}): Collaboration {
  const provider = new WebsocketProvider(url, room, doc);
  const { awareness } = provider;
  awareness.setLocalStateField("user", getLocalUser());

  const syncCursors = () => {
    const cursors: RemoteCursor[] = [];
    awareness.getStates().forEach((state, clientId) => {
      if (clientId === awareness.clientID) return;
      const cursor = parseRemoteCursor(clientId, state);
      if (cursor) cursors.push(cursor);
    });
    useCollaborationStore.getState().setCursors(cursors);
  };

  const onStatus = ({ status }: { status: ConnectionStatus }) =>
    useCollaborationStore.getState().setStatus(status);

  awareness.on("change", syncCursors);
  provider.on("status", onStatus);
  syncCursors();

  return {
    setCursor: (point) => awareness.setLocalStateField("cursor", point),
    destroy: () => {
      awareness.off("change", syncCursors);
      provider.off("status", onStatus);
      provider.destroy();
      useCollaborationStore.getState().setCursors([]);
      useCollaborationStore.getState().setStatus("disconnected");
    },
  };
}
