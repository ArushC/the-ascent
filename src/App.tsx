import "./global.css";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GameCanvas,
} from "./game/ui/gameCanvas/GameCanvas";

function App() {
  return (
    <main>
      <GameCanvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
    </main>
  );
}

export default App;
