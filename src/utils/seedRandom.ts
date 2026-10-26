/**
 * Fast and deterministic 32-bit PRNG (Mulberry32)
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed >>> 0;
  }

  /**
   * Returns a pseudo-random float between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  choice<T>(items: T[]): T {
    const idx = Math.floor(this.next() * items.length);
    return items[idx];
  }

  /**
   * Box-Muller transform for Gaussian distribution
   */
  gaussian(mean: number, stdDev: number): number {
    const u1 = Math.max(1e-7, this.next());
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }
}
