import type { Monster } from "../entities/Monster";

export function updateMonsters(
  monsters: readonly Monster[],
  deltaTime: number,
  canvasWidth: number,
): void {
  for (const monster of monsters) {
    monster.update(deltaTime, canvasWidth);
  }
}
