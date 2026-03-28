import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RestCountriesClient } from '../api/client.js';
import type { RestCountriesConfig } from '../api/types.js';
import { CountryFormatter } from '../utils/formatter.js';

export function registerSearchTools(
  server: McpServer,
  client: RestCountriesClient,
  config: RestCountriesConfig,
) {
  server.tool(
    'countries_search_by_currency',
    'Find countries that use a specific currency.',
    {
      currency: z
        .string()
        .describe("Currency code (e.g., 'USD', 'EUR') or currency name (e.g., 'dollar')"),
      fields: z.array(z.string()).optional().describe('Specific fields to return'),
    },
    async ({ currency, fields }) => {
      const countries = await client.getByCurrency(currency, fields);
      const limited = countries.slice(0, config.maxResults);
      const text = `Countries using currency "${currency}" (${countries.length} result${countries.length !== 1 ? 's' : ''})\n\n${CountryFormatter.formatCountryList(limited)}`;
      return { content: [{ type: 'text', text }] };
    },
  );

  server.tool(
    'countries_search_by_language',
    'Find countries that speak a specific language.',
    {
      language: z.string().describe("Language name (e.g., 'spanish', 'french', 'arabic')"),
      fields: z.array(z.string()).optional().describe('Specific fields to return'),
    },
    async ({ language, fields }) => {
      const countries = await client.getByLanguage(language, fields);
      const limited = countries.slice(0, config.maxResults);
      const text = `Countries speaking "${language}" (${countries.length} result${countries.length !== 1 ? 's' : ''})\n\n${CountryFormatter.formatCountryList(limited)}`;
      return { content: [{ type: 'text', text }] };
    },
  );

  server.tool(
    'countries_search_by_capital',
    'Find countries by capital city name (partial match supported).',
    {
      capital: z.string().describe('Capital city name (partial match supported)'),
      fields: z.array(z.string()).optional().describe('Specific fields to return'),
    },
    async ({ capital, fields }) => {
      const countries = await client.getByCapital(capital, fields);
      const limited = countries.slice(0, config.maxResults);
      const text = `Countries with capital matching "${capital}" (${countries.length} result${countries.length !== 1 ? 's' : ''})\n\n${CountryFormatter.formatCountryList(limited)}`;
      return { content: [{ type: 'text', text }] };
    },
  );
}
