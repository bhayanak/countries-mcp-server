import { describe, it, expect, beforeEach } from 'vitest';
import { ResponseCache } from '../src/api/cache.js';

describe('ResponseCache', () => {
  let cache: ResponseCache;

  beforeEach(() => {
    cache = new ResponseCache(1000, true);
  });

  it('should store and retrieve values', () => {
    cache.set('key1', { data: 'test' });
    expect(cache.get('key1')).toEqual({ data: 'test' });
  });

  it('should return undefined for missing keys', () => {
    expect(cache.get('missing')).toBeUndefined();
  });

  it('should track hits and misses', () => {
    cache.set('key1', 'val');
    cache.get('key1'); // hit
    cache.get('missing'); // miss
    const stats = cache.stats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.size).toBe(1);
  });

  it('should expire entries after TTL', async () => {
    const shortCache = new ResponseCache(50, true);
    shortCache.set('key', 'value');
    expect(shortCache.get('key')).toBe('value');
    await new Promise((r) => setTimeout(r, 60));
    expect(shortCache.get('key')).toBeUndefined();
  });

  it('should report has() correctly', () => {
    cache.set('key', 'val');
    expect(cache.has('key')).toBe(true);
    expect(cache.has('nope')).toBe(false);
  });

  it('should clear all entries', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.stats().size).toBe(0);
    expect(cache.get('a')).toBeUndefined();
  });

  it('should not cache when disabled', () => {
    const disabled = new ResponseCache(1000, false);
    disabled.set('key', 'value');
    expect(disabled.get('key')).toBeUndefined();
    expect(disabled.has('key')).toBe(false);
  });
});
