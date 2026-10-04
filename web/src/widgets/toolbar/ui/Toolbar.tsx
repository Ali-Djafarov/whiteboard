import { Circle, Square } from "lucide-react";
import { activateTool, useToolStore, type ToolId } from "@/features/tools";
import styles from "./Toolbar.module.css";

const ITEMS = [
  { id: "rectangle", label: "Прямоугольник", hotkey: "R", Icon: Square },
  { id: "ellipse", label: "Эллипс", hotkey: "O", Icon: Circle },
] satisfies { id: ToolId; label: string; hotkey: string; Icon: typeof Square }[];

export function Toolbar() {
  const activeTool = useToolStore((s) => s.activeTool);

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
    </div>
  );
}