import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Game } from "./game/Game";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const game = new Game(canvas, ctx);
    game.start();

    return () => {
      game.stop();
    };
  }, [isPlaying]);

  return (
    <main>
      {isPlaying ? (
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      ) : (
        <div className="home">
          <h1>Doodle Jump AI</h1>
          <button onClick={() => setIsPlaying(true)}>Play</button>
        </div>
      )}
    </main>
  );
}

export default App;
