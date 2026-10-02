import { useEffect, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import "./App.css";
import { Canvas } from "@/shared/canvas/Canvas";

const doc = new Y.Doc();
const provider = new WebsocketProvider(
  "ws://localhost:1234",
  "whiteboard",
  doc,
);

provider.on("status", ({ status }) => {
  console.log("WebSocket status:", status);
});

const map = doc.getMap<string>("test");

function App() {
  const [value, setValue] = useState("");

  useEffect(() => {
    const updateValue = () => {
      setValue(map.get("value") ?? "");
    };

    map.observe(updateValue);
    updateValue();

    return () => {
      map.unobserve(updateValue);
    };
  }, []);

  const handleWrite = () => {
    map.set("value", "Hello from Yjs!");
  };

  return (
    <>
      <section id="center">
        <div className="hero"></div>
        <div>
          <button type="button" onClick={handleWrite}>
            Записать значение
          </button>
        </div>
        <p>{value}</p>
      </section>
      <Canvas />
    </>
  );
}

export default App;
