export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };

    export function normalizeRect(r: Rect): Rect {
    return {
        x: r.width < 0 ? r.x + r.width : r.x,
        y: r.height < 0 ? r.y + r.height : r.y,
        width: Math.abs(r.width),
        height: Math.abs(r.height),
    };
    }
