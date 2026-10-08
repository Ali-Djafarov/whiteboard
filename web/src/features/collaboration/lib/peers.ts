import type { RemoteCursor } from "../model/collaborationStore";

const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const MAX_NAME_LENGTH = 32;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export function parseRemoteCursor(
  clientId: number,
  state: unknown,
): RemoteCursor | null {
  if (!isRecord(state)) return null;
  const { user, cursor } = state;
  if (!isRecord(user) || !isRecord(cursor)) return null;

  const { name, color } = user;
  const { x, y } = cursor;
  if (typeof name !== "string" || typeof color !== "string") return null;
  if (!COLOR_PATTERN.test(color) || !isFiniteNumber(x) || !isFiniteNumber(y))
    return null;

  return {
    clientId,
    name: name.slice(0, MAX_NAME_LENGTH) || "Guest",
    color,
    point: { x, y },
  };
}
