import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "24px sans-serif";
    ctx.fillText("Doodle Jump AI", 100, 100);
  }, []);

  return (
    <main>
      <canvas ref={canvasRef} width={400} height={600} />
    </main>
  );
}

export default App;