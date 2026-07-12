import type { Projectile } from "../entities/Projectile";

export type ProjectileViewport = {
  screenTopY: number;
  canvasWidth: number;
  canvasHeight: number;
};

export function updateProjectiles(
  projectiles: readonly Projectile[],
  deltaTime: number,
): void {
  for (const projectile of projectiles) {
    projectile.y += projectile.velocityY * deltaTime;
  }
}

export function removeOffScreenProjectiles(
  projectiles: readonly Projectile[],
  viewport: ProjectileViewport,
): Projectile[] {
  const screenBottomY = viewport.screenTopY + viewport.canvasHeight;

  return projectiles.filter(
    (projectile) =>
      projectile.y + projectile.height >= viewport.screenTopY &&
      projectile.y <= screenBottomY &&
      projectile.x + projectile.width >= 0 &&
      projectile.x <= viewport.canvasWidth,
  );
}
