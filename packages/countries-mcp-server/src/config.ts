import type { RestCountriesConfig } from './api/types.js';

export function loadConfig(): RestCountriesConfig {
  const env = process.env;
  return {
    baseUrl: env.RESTCOUNTRIES_MCP_BASE_URL ?? 'https://restcountries.com/v3.1',
    cacheTtlMs: parseInt(env.RESTCOUNTRIES_MCP_CACHE_TTL_MS ?? '3600000', 10),
    cacheEnabled: (env.RESTCOUNTRIES_MCP_CACHE_ENABLED ?? 'true') === 'true',
    timeoutMs: parseInt(env.RESTCOUNTRIES_MCP_TIMEOUT_MS ?? '10000', 10),
    maxResults: parseInt(env.RESTCOUNTRIES_MCP_MAX_RESULTS ?? '50', 10),
    defaultFields: (
      env.RESTCOUNTRIES_MCP_DEFAULT_FIELDS ?? 'name,capital,population,region,flags'
    ).split(','),
    retryCount: parseInt(env.RESTCOUNTRIES_MCP_RETRY_COUNT ?? '2', 10),
  };
}
