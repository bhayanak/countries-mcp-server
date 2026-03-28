import type { CacheEntry } from './types.js';

export class ResponseCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private hits = 0;
  private misses = 0;

  constructor(
    private ttlMs: number,
    private enabled: boolean,
  ) {}

  get<T>(key: string): T | undefined {
    if (!this.enabled) {
      this.misses++;
      return undefined;
    }
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }
    this.hits++;
    return entry.data as T;
  }

  set<T>(key: string, value: T): void {
    if (!this.enabled) return;
    this.cache.set(key, {
      data: value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  has(key: string): boolean {
    if (!this.enabled) return false;
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  stats(): { hits: number; misses: number; size: number } {
    return { hits: this.hits, misses: this.misses, size: this.cache.size };
  }
}
