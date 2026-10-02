import { BoardCanvas } from "@/widgets/board-canvas/BoardCanvas";
import { ControlsHint } from "@/widgets/control-hint";


export function BoardPage() {
  return (
    <div style={{ position: "relative", height: "100%", background: "#fff" }}>
      <BoardCanvas />
      <ControlsHint />
    </div>
  );
}