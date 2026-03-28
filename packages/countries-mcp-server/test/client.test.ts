import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RestCountriesClient } from '../src/api/client.js';
import type { RestCountriesConfig } from '../src/api/types.js';
import peruFixture from './fixtures/country-peru.json';
import countryListFixture from './fixtures/country-list.json';

const baseConfig: RestCountriesConfig = {
  baseUrl: 'https://restcountries.com/v3.1',
  cacheTtlMs: 3600000,
  cacheEnabled: false, // disable cache for tests
  timeoutMs: 5000,
  maxResults: 50,
  defaultFields: ['name', 'capital', 'population'],
  retryCount: 0,
};

function mockFetch(data: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  });
}

describe('RestCountriesClient', () => {
  let client: RestCountriesClient;

  beforeEach(() => {
    client = new RestCountriesClient(baseConfig);
    vi.restoreAllMocks();
  });

  it('getByName should call correct endpoint', async () => {
    const fetchMock = mockFetch([peruFixture]);
    vi.stubGlobal('fetch', fetchMock);
    const result = await client.getByName('peru');
    expect(result).toHaveLength(1);
    expect(result[0].name.common).toBe('Peru');
    expect(fetchMock).toHaveBeenCalledOnce();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/name/peru');
  });

  it('getByName with fullText should add query param', async () => {
    const fetchMock = mockFetch([peruFixture]);
    vi.stubGlobal('fetch', fetchMock);
    await client.getByName('Peru', true);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('fullText=true');
  });

  it('getByCode should return a single country', async () => {
    const fetchMock = mockFetch([peruFixture]);
    vi.stubGlobal('fetch', fetchMock);
    const result = await client.getByCode('PE');
    expect(result.name.common).toBe('Peru');
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/alpha/PE');
  });

  it('getByCodes should call correct endpoint', async () => {
    const fetchMock = mockFetch(countryListFixture);
    vi.stubGlobal('fetch', fetchMock);
    const result = await client.getByCodes(['DE', 'FR']);
    expect(result).toHaveLength(2);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('codes=DE,FR');
  });

  it('getByCurrency should call correct endpoint', async () => {
    const fetchMock = mockFetch(countryListFixture);
    vi.stubGlobal('fetch', fetchMock);
    const result = await client.getByCurrency('EUR');
    expect(result).toHaveLength(2);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/currency/EUR');
  });

  it('getByLanguage should call correct endpoint', async () => {
    const fetchMock = mockFetch(countryListFixture);
    vi.stubGlobal('fetch', fetchMock);
    await client.getByLanguage('spanish');
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/lang/spanish');
  });

  it('getByCapital should call correct endpoint', async () => {
    const fetchMock = mockFetch([peruFixture]);
    vi.stubGlobal('fetch', fetchMock);
    await client.getByCapital('lima');
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/capital/lima');
  });

  it('getByRegion should call correct endpoint', async () => {
    const fetchMock = mockFetch(countryListFixture);
    vi.stubGlobal('fetch', fetchMock);
    await client.getByRegion('Europe');
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/region/Europe');
  });

  it('getBySubregion should call correct endpoint', async () => {
    const fetchMock = mockFetch(countryListFixture);
    vi.stubGlobal('fetch', fetchMock);
    await client.getBySubregion('Western Europe');
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/subregion/Western%20Europe');
  });

  it('getByDemonym should call correct endpoint', async () => {
    const fetchMock = mockFetch([peruFixture]);
    vi.stubGlobal('fetch', fetchMock);
    await client.getByDemonym('Peruvian');
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/demonym/Peruvian');
  });

  it('getAll should call correct endpoint with fields', async () => {
    const fetchMock = mockFetch(countryListFixture);
    vi.stubGlobal('fetch', fetchMock);
    await client.getAll(['name', 'capital']);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/all');
    expect(url).toContain('fields=name');
    expect(url).toContain('capital');
  });

  it('should throw on 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({}),
      }),
    );
    await expect(client.getByName('xyznonexistent')).rejects.toThrow('No results found');
  });

  it('should throw on server error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({}),
      }),
    );
    await expect(client.getByName('test')).rejects.toThrow('API error');
  });

  it('should add field filtering to URL', async () => {
    const fetchMock = mockFetch([peruFixture]);
    vi.stubGlobal('fetch', fetchMock);
    await client.getByName('peru', false, ['name', 'capital']);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('fields=name');
    expect(url).toContain('capital');
  });

  it('should retry on transient fetch error', async () => {
    const retryClient = new RestCountriesClient({ ...baseConfig, retryCount: 1 });
    let callCount = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.reject(new Error('network error'));
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve([peruFixture]),
        });
      }),
    );
    const result = await retryClient.getByName('peru');
    expect(result).toHaveLength(1);
    expect(callCount).toBe(2);
  });

  it('should throw timeout error on abort', async () => {
    const timeoutClient = new RestCountriesClient({ ...baseConfig, timeoutMs: 1, retryCount: 0 });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        (_url: string, opts: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            opts.signal.addEventListener('abort', () => {
              const err = new Error('The operation was aborted');
              err.name = 'AbortError';
              reject(err);
            });
          }),
      ),
    );
    await expect(timeoutClient.getByName('peru')).rejects.toThrow('Request timed out');
  });

  it('should use cache on second call', async () => {
    const cachedClient = new RestCountriesClient({ ...baseConfig, cacheEnabled: true });
    const fetchMock = mockFetch([peruFixture]);
    vi.stubGlobal('fetch', fetchMock);
    await cachedClient.getByName('peru');
    await cachedClient.getByName('peru');
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
