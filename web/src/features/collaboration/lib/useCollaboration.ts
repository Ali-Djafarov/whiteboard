import { useEffect } from "react";
import type * as Y from "yjs";
import type { Point } from "@/shared/canvas";
import { getRoomId, WS_URL } from "./config";
import { createCollaboration, type Collaboration } from "./createCollaboration";

let active: Collaboration | null = null;

export function publishCursor(point: Point | null): void {
  active?.setCursor(point);
}

export function useCollaboration(doc: Y.Doc): void {
  useEffect(() => {
    const collaboration = createCollaboration({
      doc,
      url: WS_URL,
      room: getRoomId(),
    });
    active = collaboration;
    return () => {
      collaboration.destroy();
      if (active === collaboration) active = null;
    };
  }, [doc]);
}
