import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import "./App.css";

import { BoardPage } from "@/pages/board/ui/BoardPage";

const doc = new Y.Doc();
const provider = new WebsocketProvider(
  "ws://localhost:1234",
  "whiteboard",
  doc,
);

provider.on("status", ({ status }) => {
  console.log("WebSocket status:", status);
});

function App() {
  return <BoardPage />;
}

export default App;
