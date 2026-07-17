// Standard constants for the tiny mulberry32 PRNG and 32-bit FNV-1a hash.
const MULBERRY32_INCREMENT = 0x6d2b79f5;
const UINT32_RANGE = 2 ** 32;
const FNV_1A_OFFSET_BASIS = 0x811c9dc5;
const FNV_1A_PRIME = 0x01000193;

/** Random-like source returning values in [0, 1); seeded RNGs are repeatable. */
export type Rng = () => number;

/** Small non-cryptographic PRNG; useful for reproducible gameplay layouts. */
export function createSeededRng(seed: number): Rng {
  let state = seed >>> 0;

  return () => {
    state = (state + MULBERRY32_INCREMENT) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / UINT32_RANGE;
  };
}

export function createMathRng(): Rng {
  return () => Math.random();
}

export function randomBetween(min: number, max: number, rng: Rng): number {
  if (min === max) return min;

  return min + rng() * (max - min);
}

/** Stable FNV-1a hash from a YYYY-MM-DD challenge date to a uint32 seed. */
export function hashDateToSeed(challengeDate: string): number {
  let hash = FNV_1A_OFFSET_BASIS;

  for (let index = 0; index < challengeDate.length; index += 1) {
    hash ^= challengeDate.charCodeAt(index);
    hash = Math.imul(hash, FNV_1A_PRIME);
  }

  return hash >>> 0;
}
