import type { Country, RestCountriesConfig } from './types.js';
import { ResponseCache } from './cache.js';

export class RestCountriesClient {
  private cache: ResponseCache;

  constructor(private config: RestCountriesConfig) {
    this.cache = new ResponseCache(config.cacheTtlMs, config.cacheEnabled);
  }

  private buildUrl(path: string, fields?: string[]): string {
    const url = new URL(
      path,
      this.config.baseUrl.endsWith('/') ? this.config.baseUrl : this.config.baseUrl + '/',
    );
    if (fields && fields.length > 0) {
      url.searchParams.set('fields', fields.join(','));
    }
    return url.toString();
  }

  private async fetchWithRetry(url: string): Promise<unknown> {
    const cached = this.cache.get<unknown>(url);
    if (cached !== undefined) return cached;

    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= this.config.retryCount; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
        try {
          const response = await fetch(url, { signal: controller.signal });
          if (response.status === 404) {
            throw new Error('No results found');
          }
          if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
          const data: unknown = await response.json();
          this.cache.set(url, data);
          return data;
        } finally {
          clearTimeout(timeout);
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (lastError.name === 'AbortError') {
          lastError = new Error('Request timed out');
        }
        if (attempt < this.config.retryCount) {
          await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
        }
      }
    }
    throw lastError;
  }

  async getByName(name: string, fullText = false, fields?: string[]): Promise<Country[]> {
    const encoded = encodeURIComponent(name);
    const path = fullText ? `name/${encoded}?fullText=true` : `name/${encoded}`;
    const url = this.buildUrl(path, fields);
    return (await this.fetchWithRetry(url)) as Country[];
  }

  async getByCode(code: string, fields?: string[]): Promise<Country> {
    const encoded = encodeURIComponent(code);
    const url = this.buildUrl(`alpha/${encoded}`, fields);
    const result = await this.fetchWithRetry(url);
    return Array.isArray(result) ? (result as Country[])[0] : (result as Country);
  }

  async getByCodes(codes: string[], fields?: string[]): Promise<Country[]> {
    const encoded = codes.map((c) => encodeURIComponent(c)).join(',');
    const url = this.buildUrl(`alpha?codes=${encoded}`, fields);
    return (await this.fetchWithRetry(url)) as Country[];
  }

  async getByCurrency(currency: string, fields?: string[]): Promise<Country[]> {
    const encoded = encodeURIComponent(currency);
    const url = this.buildUrl(`currency/${encoded}`, fields);
    return (await this.fetchWithRetry(url)) as Country[];
  }

  async getByLanguage(language: string, fields?: string[]): Promise<Country[]> {
    const encoded = encodeURIComponent(language);
    const url = this.buildUrl(`lang/${encoded}`, fields);
    return (await this.fetchWithRetry(url)) as Country[];
  }

  async getByCapital(capital: string, fields?: string[]): Promise<Country[]> {
    const encoded = encodeURIComponent(capital);
    const url = this.buildUrl(`capital/${encoded}`, fields);
    return (await this.fetchWithRetry(url)) as Country[];
  }

  async getByRegion(region: string, fields?: string[]): Promise<Country[]> {
    const encoded = encodeURIComponent(region);
    const url = this.buildUrl(`region/${encoded}`, fields);
    return (await this.fetchWithRetry(url)) as Country[];
  }

  async getBySubregion(subregion: string, fields?: string[]): Promise<Country[]> {
    const encoded = encodeURIComponent(subregion);
    const url = this.buildUrl(`subregion/${encoded}`, fields);
    return (await this.fetchWithRetry(url)) as Country[];
  }

  async getByDemonym(demonym: string, fields?: string[]): Promise<Country[]> {
    const encoded = encodeURIComponent(demonym);
    const url = this.buildUrl(`demonym/${encoded}`, fields);
    return (await this.fetchWithRetry(url)) as Country[];
  }

  async getAll(fields: string[]): Promise<Country[]> {
    const url = this.buildUrl('all', fields);
    return (await this.fetchWithRetry(url)) as Country[];
  }
}
