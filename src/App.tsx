import "./App.css";
import { GameCanvas } from "./game/GameCanvas";

export const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

function App() {
  return (
    <main>
      <GameCanvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
    </main>
  );
}

export default App;
