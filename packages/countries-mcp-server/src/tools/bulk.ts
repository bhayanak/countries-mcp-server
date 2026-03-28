import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RestCountriesClient } from '../api/client.js';
import type { RestCountriesConfig } from '../api/types.js';
import { CountryFormatter } from '../utils/formatter.js';

export function registerBulkTools(
  server: McpServer,
  client: RestCountriesClient,
  config: RestCountriesConfig,
) {
  server.tool(
    'countries_get_all',
    'Retrieve data for all 250+ countries. Field filtering is required.',
    {
      fields: z
        .array(z.string())
        .min(1)
        .max(10)
        .describe(
          "Required: fields to return (max 10). E.g., ['name', 'capital', 'population', 'region', 'flags']",
        ),
      sortBy: z
        .enum(['name', 'population', 'area'])
        .optional()
        .default('name')
        .describe('Sort results by field'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
      limit: z.number().optional().describe('Limit number of results returned'),
    },
    async ({ fields, sortBy, sortOrder, limit }) => {
      const countries = await client.getAll(fields);
      const effectiveLimit = limit ?? config.maxResults;
      const text = `All countries (${countries.length} total, showing up to ${effectiveLimit})\n\n${CountryFormatter.formatCountryList(countries, { sortBy, sortOrder, limit: effectiveLimit })}`;
      return { content: [{ type: 'text', text }] };
    },
  );

  server.tool(
    'countries_get_by_codes',
    'Get multiple countries by their codes at once.',
    {
      codes: z
        .array(z.string())
        .min(1)
        .max(20)
        .describe('Array of country codes (cca2, cca3, or ccn3)'),
      fields: z.array(z.string()).optional().describe('Specific fields to return'),
    },
    async ({ codes, fields }) => {
      const countries = await client.getByCodes(codes, fields);
      const text = `Countries for codes [${codes.join(', ')}] (${countries.length} result${countries.length !== 1 ? 's' : ''})\n\n${countries.map((c) => CountryFormatter.formatCountry(c)).join('\n\n')}`;
      return { content: [{ type: 'text', text }] };
    },
  );
}
