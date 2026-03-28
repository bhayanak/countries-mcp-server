import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RestCountriesClient } from '../api/client.js';
import type { RestCountriesConfig } from '../api/types.js';
import { CountryFormatter } from '../utils/formatter.js';

export function registerLookupTools(
  server: McpServer,
  client: RestCountriesClient,
  config: RestCountriesConfig,
) {
  server.tool(
    'countries_get_by_name',
    'Search for countries by common or official name. Supports partial matching.',
    {
      name: z.string().describe('Country name to search for (common or official, partial match)'),
      fullText: z
        .boolean()
        .optional()
        .default(false)
        .describe('If true, search by exact full name only'),
      fields: z
        .array(z.string())
        .optional()
        .describe("Specific fields to return (e.g., ['name', 'capital', 'population'])"),
    },
    async ({ name, fullText, fields }) => {
      const countries = await client.getByName(name, fullText, fields);
      const limited = countries.slice(0, config.maxResults);
      const text = `Countries matching "${name}" (${countries.length} result${countries.length !== 1 ? 's' : ''})\n\n${limited.map((c) => CountryFormatter.formatCountry(c)).join('\n\n')}`;
      return { content: [{ type: 'text', text }] };
    },
  );

  server.tool(
    'countries_get_by_code',
    'Retrieve a single country by its cca2, cca3, ccn3, or cioc code.',
    {
      code: z
        .string()
        .describe("Country code (cca2: 'CO', cca3: 'COL', ccn3: '170', or cioc: 'COL')"),
      fields: z.array(z.string()).optional().describe('Specific fields to return'),
    },
    async ({ code, fields }) => {
      const country = await client.getByCode(code, fields);
      const text = CountryFormatter.formatCountry(country);
      return { content: [{ type: 'text', text }] };
    },
  );

  server.tool(
    'countries_get_by_full_name',
    'Get country by exact full name (common or official).',
    {
      name: z.string().describe('Exact full name of the country (common or official)'),
      fields: z.array(z.string()).optional().describe('Specific fields to return'),
    },
    async ({ name, fields }) => {
      const countries = await client.getByName(name, true, fields);
      if (countries.length === 0) {
        return { content: [{ type: 'text', text: `No country found with exact name "${name}"` }] };
      }
      const text = CountryFormatter.formatCountry(countries[0]);
      return { content: [{ type: 'text', text }] };
    },
  );
}
