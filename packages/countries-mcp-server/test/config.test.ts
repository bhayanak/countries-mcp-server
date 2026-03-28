import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { RestCountriesConfig } from '../src/api/types.js';

describe('loadConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return defaults when no env vars set', async () => {
    delete process.env.RESTCOUNTRIES_MCP_BASE_URL;
    delete process.env.RESTCOUNTRIES_MCP_CACHE_TTL_MS;
    delete process.env.RESTCOUNTRIES_MCP_CACHE_ENABLED;
    delete process.env.RESTCOUNTRIES_MCP_TIMEOUT_MS;
    delete process.env.RESTCOUNTRIES_MCP_MAX_RESULTS;
    delete process.env.RESTCOUNTRIES_MCP_DEFAULT_FIELDS;
    delete process.env.RESTCOUNTRIES_MCP_RETRY_COUNT;

    const { loadConfig } = await import('../src/config.js');
    const config: RestCountriesConfig = loadConfig();
    expect(config.baseUrl).toBe('https://restcountries.com/v3.1');
    expect(config.cacheTtlMs).toBe(3600000);
    expect(config.cacheEnabled).toBe(true);
    expect(config.timeoutMs).toBe(10000);
    expect(config.maxResults).toBe(50);
    expect(config.defaultFields).toEqual(['name', 'capital', 'population', 'region', 'flags']);
    expect(config.retryCount).toBe(2);
  });

  it('should read from env vars when set', async () => {
    process.env.RESTCOUNTRIES_MCP_BASE_URL = 'https://custom.api/v3';
    process.env.RESTCOUNTRIES_MCP_CACHE_TTL_MS = '60000';
    process.env.RESTCOUNTRIES_MCP_CACHE_ENABLED = 'false';
    process.env.RESTCOUNTRIES_MCP_TIMEOUT_MS = '5000';
    process.env.RESTCOUNTRIES_MCP_MAX_RESULTS = '10';
    process.env.RESTCOUNTRIES_MCP_DEFAULT_FIELDS = 'name,population';
    process.env.RESTCOUNTRIES_MCP_RETRY_COUNT = '5';

    const { loadConfig } = await import('../src/config.js');
    const config = loadConfig();
    expect(config.baseUrl).toBe('https://custom.api/v3');
    expect(config.cacheTtlMs).toBe(60000);
    expect(config.cacheEnabled).toBe(false);
    expect(config.timeoutMs).toBe(5000);
    expect(config.maxResults).toBe(10);
    expect(config.defaultFields).toEqual(['name', 'population']);
    expect(config.retryCount).toBe(5);
  });
});
