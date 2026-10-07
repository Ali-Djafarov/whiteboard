import {
  ArrowUpRight,
  Circle,
  MousePointer2,
  Grid2X2,
  Square,
  Pencil,
  Type,
  Undo2,
  Redo2,
} from "lucide-react";
import { activateTool, useToolStore, type ToolId } from "@/features/tools";
import styles from "./Toolbar.module.css";
import { useGridStore } from "@/features/grid";
import { sceneApi, useHistoryStore } from "@/entities/scene";
const ITEMS = [
  { id: "select", label: "Выбор", hotkey: "V", Icon: MousePointer2 },
  { id: "rectangle", label: "Прямоугольник", hotkey: "R", Icon: Square },
  { id: "ellipse", label: "Эллипс", hotkey: "O", Icon: Circle },
  { id: "arrow", label: "Стрелка", hotkey: "A", Icon: ArrowUpRight },
  { id: "pen", label: "Карандаш", hotkey: "P", Icon: Pencil },
  { id: "text", label: "Текст", hotkey: "T", Icon: Type },
] satisfies {
  id: ToolId;
  label: string;
  hotkey: string;
  Icon: typeof Square;
}[];

export function Toolbar() {
  const activeTool = useToolStore((s) => s.activeTool);
  const isGridVisible = useGridStore((s) => s.isVisible);
  const toggleGrid = useGridStore((s) => s.toggleGrid);
  const canUndo = useHistoryStore((s) => s.canUndo);
  const canRedo = useHistoryStore((s) => s.canRedo);

  return (
    <div className={styles.root} role="toolbar" aria-label="Инструменты">
      {ITEMS.map(({ id, label, hotkey, Icon }) => (
        <button
          key={id}
          type="button"
          className={styles.button}
          aria-pressed={activeTool === id}
          aria-label={label}
          title={`${label} (${hotkey})`}
          onClick={() => activateTool(id)}
        >
          <Icon size={18} />
        </button>
      ))}
      <span
        className={styles.divider}
        role="separator"
        aria-orientation="vertical"
      />
      <button
        type="button"
        className={styles.button}
        disabled={!canUndo}
        onClick={() => sceneApi.undo()}
        aria-label="Отменить"
        title="Отменить (Ctrl/⌘ + Z)"
      >
        <Undo2 size={18} />
      </button>
      <button
        type="button"
        className={styles.button}
        disabled={!canRedo}
        onClick={() => sceneApi.redo()}
        aria-label="Повторить"
        title="Повторить (Ctrl/⌘ + Shift + Z)"
      >
        <Redo2 size={18} />
      </button>
      <button
        type="button"
        className={styles.button}
        aria-pressed={isGridVisible}
        aria-label={isGridVisible ? "Скрыть сетку" : "Показать сетку"}
        title={isGridVisible ? "Скрыть сетку" : "Показать сетку"}
        onClick={toggleGrid}
      >
        <Grid2X2 size={18} />
      </button>
    </div>
  );
}
