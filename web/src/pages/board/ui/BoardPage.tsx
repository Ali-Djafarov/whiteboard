import { BoardCanvas } from "@/widgets/board-canvas";
import { ControlsHint } from "@/widgets/control-hint";
import { Toolbar } from "@/widgets/toolbar";
import styles from "./BoardPage.module.css";

export function BoardPage() {
  return (
    <div className={styles.root}>
      <BoardCanvas />
      <Toolbar />
      <ControlsHint />
    </div>
  );
}
