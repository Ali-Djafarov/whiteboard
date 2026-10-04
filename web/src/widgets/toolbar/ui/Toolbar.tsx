import { Circle, MousePointer2, Grid2X2, Square } from "lucide-react";
import { activateTool, useToolStore, type ToolId } from "@/features/tools";
import styles from "./Toolbar.module.css";
import { useGridStore } from "@/features/grid";
const ITEMS = [
  { id: "select", label: "Выбор", hotkey: "V", Icon: MousePointer2 },
  { id: "rectangle", label: "Прямоугольник", hotkey: "R", Icon: Square },
  { id: "ellipse", label: "Эллипс", hotkey: "O", Icon: Circle },
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
