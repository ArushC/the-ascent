export type PowerupUsageHistory = Set<string>;

export function createPowerupUsageHistory(): PowerupUsageHistory {
  return new Set();
}

export function recordPowerupUse(
  history: PowerupUsageHistory,
  id: string,
): void {
  history.add(id);
}

export function hasUsedAllPowerups(
  history: PowerupUsageHistory,
  allIds: readonly string[],
): boolean {
  return allIds.every((id) => history.has(id));
}
