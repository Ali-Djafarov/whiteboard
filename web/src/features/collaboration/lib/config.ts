const DEFAULT_URL = "ws://localhost:1234";
const ROOM_PATTERN = /^[\w-]{4,64}$/;

export const WS_URL: string = import.meta.env.VITE_WS_URL ?? DEFAULT_URL;

export function getRoomId(): string {
  const fromHash = location.hash.slice(1);
  if (ROOM_PATTERN.test(fromHash)) return fromHash;

  const room = crypto.randomUUID().slice(0, 8);
  history.replaceState(null, "", `#${room}`);
  return room;
}