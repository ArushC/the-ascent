import type { Rng } from "../rng/seededRng/SeededRng";

export function constantRng(value: number): Rng {
  return () => value;
}

export function sequenceRng(values: readonly number[]): Rng {
  let index = 0;

  return () => values[index++] ?? values.at(-1) ?? 0;
}
