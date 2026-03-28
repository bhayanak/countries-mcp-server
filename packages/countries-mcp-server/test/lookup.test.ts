import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';
import type { RestCountriesConfig } from '../src/api/types.js';
import peruFixture from './fixtures/country-peru.json';
import countryListFixture from './fixtures/country-list.json';
import regionFixture from './fixtures/region-europe.json';

const config: RestCountriesConfig = {
  baseUrl: 'https://restcountries.com/v3.1',
  cacheTtlMs: 3600000,
  cacheEnabled: false,
  timeoutMs: 5000,
  maxResults: 50,
  defaultFields: ['name', 'capital', 'population'],
  retryCount: 0,
};

function mockFetchForUrl(mapping: Record<string, unknown>) {
  return vi.fn().mockImplementation((url: string) => {
    for (const [pattern, data] of Object.entries(mapping)) {
      if (url.includes(pattern)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve(data),
        });
      }
    }
    return Promise.resolve({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({}),
    });
  });
}

describe('MCP Server Integration — Lookup Tools', () => {
  let client: Client;

  beforeEach(async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchForUrl({
        '/name/peru': [peruFixture],
        '/name/Republic%20of%20Peru': [peruFixture],
        '/alpha/PE': [peruFixture],
      }),
    );

    const server = createServer(config);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'test', version: '1.0' });
    await client.connect(clientTransport);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('countries_get_by_name returns matching countries', async () => {
    const result = await client.callTool({
      name: 'countries_get_by_name',
      arguments: { name: 'peru' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Peru');
    expect(text).toContain('Lima');
  });

  it('countries_get_by_code returns a single country', async () => {
    const result = await client.callTool({
      name: 'countries_get_by_code',
      arguments: { code: 'PE' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Peru');
  });

  it('countries_get_by_full_name returns exact match', async () => {
    const result = await client.callTool({
      name: 'countries_get_by_full_name',
      arguments: { name: 'Republic of Peru' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Peru');
  });
});

describe('MCP Server Integration — Search Tools', () => {
  let client: Client;

  beforeEach(async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchForUrl({
        '/currency/EUR': countryListFixture,
        '/lang/french': countryListFixture,
        '/capital/paris': countryListFixture,
      }),
    );

    const server = createServer(config);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'test', version: '1.0' });
    await client.connect(clientTransport);
  });

  afterEach(() => vi.restoreAllMocks());

  it('countries_search_by_currency returns results', async () => {
    const result = await client.callTool({
      name: 'countries_search_by_currency',
      arguments: { currency: 'EUR' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('EUR');
    expect(text).toContain('Germany');
  });

  it('countries_search_by_language returns results', async () => {
    const result = await client.callTool({
      name: 'countries_search_by_language',
      arguments: { language: 'french' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('french');
  });

  it('countries_search_by_capital returns results', async () => {
    const result = await client.callTool({
      name: 'countries_search_by_capital',
      arguments: { capital: 'paris' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('paris');
  });
});

describe('MCP Server Integration — Filter Tools', () => {
  let client: Client;

  beforeEach(async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchForUrl({
        '/region/Europe': regionFixture,
        '/subregion/Western%20Europe': countryListFixture,
        '/demonym/German': countryListFixture,
      }),
    );

    const server = createServer(config);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'test', version: '1.0' });
    await client.connect(clientTransport);
  });

  afterEach(() => vi.restoreAllMocks());

  it('countries_get_by_region returns results', async () => {
    const result = await client.callTool({
      name: 'countries_get_by_region',
      arguments: { region: 'Europe' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Europe');
    expect(text).toContain('3 result');
  });

  it('countries_get_by_subregion returns results', async () => {
    const result = await client.callTool({
      name: 'countries_get_by_subregion',
      arguments: { subregion: 'Western Europe' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Western Europe');
  });

  it('countries_get_by_demonym returns results', async () => {
    const result = await client.callTool({
      name: 'countries_get_by_demonym',
      arguments: { demonym: 'German' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('German');
  });
});

describe('MCP Server Integration — Compare & Bulk Tools', () => {
  let client: Client;

  beforeEach(async () => {
    // Germany fixture with borders array included
    const germanyWithBorders = {
      ...countryListFixture[0],
      borders: ['FRA'],
    };
    vi.stubGlobal(
      'fetch',
      mockFetchForUrl({
        'codes=DE,FR': countryListFixture,
        '/all': regionFixture,
        '/alpha/DE': germanyWithBorders,
        'codes=FRA': [countryListFixture[1]],
      }),
    );

    const server = createServer(config);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'test', version: '1.0' });
    await client.connect(clientTransport);
  });

  afterEach(() => vi.restoreAllMocks());

  it('countries_compare returns comparison table', async () => {
    const result = await client.callTool({
      name: 'countries_compare',
      arguments: { codes: ['DE', 'FR'] },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Comparison');
    expect(text).toContain('Germany');
    expect(text).toContain('France');
  });

  it('countries_get_by_codes returns multiple countries', async () => {
    const result = await client.callTool({
      name: 'countries_get_by_codes',
      arguments: { codes: ['DE', 'FR'] },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Germany');
    expect(text).toContain('France');
  });

  it('countries_get_all returns country list', async () => {
    const result = await client.callTool({
      name: 'countries_get_all',
      arguments: { fields: ['name', 'capital'] },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('All countries');
  });

  it('countries_get_borders returns border info', async () => {
    const result = await client.callTool({
      name: 'countries_get_borders',
      arguments: { code: 'DE' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('Borders');
    expect(text).toContain('Germany');
    expect(text).toContain('France');
    expect(text).toContain('1 neighbors');
  });
});

describe('MCP Server Integration — Borders (no borders)', () => {
  let client: Client;

  beforeEach(async () => {
    const islandCountry = {
      ...countryListFixture[0],
      borders: [],
    };
    vi.stubGlobal(
      'fetch',
      mockFetchForUrl({
        '/alpha/JP': islandCountry,
      }),
    );
    const server = createServer(config);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'test', version: '1.0' });
    await client.connect(clientTransport);
  });

  afterEach(() => vi.restoreAllMocks());

  it('countries_get_borders returns no borders message for island', async () => {
    const result = await client.callTool({
      name: 'countries_get_borders',
      arguments: { code: 'JP' },
    });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('no land borders');
  });
});
