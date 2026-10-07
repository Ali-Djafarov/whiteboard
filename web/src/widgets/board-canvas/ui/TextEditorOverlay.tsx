import { useEffect, useRef } from "react";
import {
  TEXT_FONT_FAMILY,
  TEXT_LINE_HEIGHT,
  measureTextWidth,
} from "@/entities/scene";
import { useViewportStore } from "@/features/pan-zoom";
import {
  commitTextEditor,
  useToolStore,
  type TextEditorState,
} from "@/features/tools";
import styles from "./BoardCanvas.module.css";

export function TextEditorOverlay() {
  const editor = useToolStore((s) => s.textEditor);
  return editor ? <TextArea key={editor.session} editor={editor} /> : null;
}

function TextArea({ editor }: { editor: TextEditorState }) {
  const viewport = useViewportStore((s) => s.viewport);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  const lines = editor.text.split("\n");
  const width = Math.max(
    editor.fontSize * 0.6,
    ...lines.map((line) => measureTextWidth(line, editor.fontSize)),
  );
  const height = lines.length * editor.fontSize * TEXT_LINE_HEIGHT;
  const { zoom } = viewport;

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <textarea
      ref={ref}
      className={styles.textEditor}
      aria-label="Текст"
      value={editor.text}
      wrap="off"
      spellCheck={false}
      style={{
        left: editor.x * zoom + viewport.offsetX,
        top: editor.y * zoom + viewport.offsetY,
        width: (width + editor.fontSize * 0.4) * zoom,
        height: height * zoom,
        fontSize: editor.fontSize * zoom,
        lineHeight: TEXT_LINE_HEIGHT,
        fontFamily: TEXT_FONT_FAMILY,
      }}
      onChange={(e) =>
        useToolStore.getState().setTextEditorValue(e.target.value)
      }
      onBlur={() => commitTextEditor()}
      onKeyDown={(e) => {
        if (
          e.key === "Escape" ||
          (e.key === "Enter" && (e.ctrlKey || e.metaKey))
        ) {
          e.preventDefault();
          commitTextEditor({ select: true });
        }
      }}
      onPointerDown={stop}
      onPointerMove={stop}
      onPointerUp={stop}
      onDoubleClick={stop}
    />
  );
}
