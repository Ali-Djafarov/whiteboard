export const TEXT_FONT_FAMILY = "system-ui, sans-serif";
export const textFont = (fontSize: number): string =>
  `${fontSize}px ${TEXT_FONT_FAMILY}`;

const CACHE_LIMIT = 500;
const cache = new Map<string, number>();
let context: CanvasRenderingContext2D | null | undefined;

const getContext = (): CanvasRenderingContext2D | null => {
  if (context === undefined) {
    context =
      typeof document === "undefined"
        ? null
        : document.createElement("canvas").getContext("2d");
  }
  return context;
};

export function measureTextWidth(text: string, fontSize: number): number {
  const key = `${fontSize}|${text}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const ctx = getContext();
  let width: number;
  if (ctx) {
    ctx.font = textFont(fontSize);
    width = ctx.measureText(text).width;
  } else {
    width = text.length * fontSize * 0.6;
  }

  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(key, width);
  return width;
}
