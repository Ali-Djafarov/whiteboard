import { BoardCanvas } from "@/widgets/board-canvas";
import { ControlsHint } from "@/widgets/control-hint";
import { Toolbar } from "@/widgets/toolbar";


export function BoardPage() {
  return (
    <div style={{ position: "relative", height: "100%", background: "#fff" }}>
      <BoardCanvas />
      <Toolbar />
      <ControlsHint />
    </div>
  );
}