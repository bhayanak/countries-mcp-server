import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RestCountriesClient } from '../api/client.js';
import type { RestCountriesConfig } from '../api/types.js';
import { CountryFormatter } from '../utils/formatter.js';

export function registerFilterTools(
  server: McpServer,
  client: RestCountriesClient,
  config: RestCountriesConfig,
) {
  server.tool(
    'countries_get_by_region',
    'Get all countries in a geographic region.',
    {
      region: z
        .string()
        .describe("Region name: 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Antarctic'"),
      fields: z.array(z.string()).optional().describe('Specific fields to return'),
    },
    async ({ region, fields }) => {
      const countries = await client.getByRegion(region, fields);
      const limited = countries.slice(0, config.maxResults);
      const text = `Countries in ${region} (${countries.length} result${countries.length !== 1 ? 's' : ''})\n\n${CountryFormatter.formatCountryList(limited)}`;
      return { content: [{ type: 'text', text }] };
    },
  );

  server.tool(
    'countries_get_by_subregion',
    'Get all countries in a subregion.',
    {
      subregion: z
        .string()
        .describe("Subregion name (e.g., 'Western Europe', 'South America', 'Southeast Asia')"),
      fields: z.array(z.string()).optional().describe('Specific fields to return'),
    },
    async ({ subregion, fields }) => {
      const countries = await client.getBySubregion(subregion, fields);
      const limited = countries.slice(0, config.maxResults);
      const text = `Countries in ${subregion} (${countries.length} result${countries.length !== 1 ? 's' : ''})\n\n${CountryFormatter.formatCountryList(limited)}`;
      return { content: [{ type: 'text', text }] };
    },
  );

  server.tool(
    'countries_get_by_demonym',
    'Find countries by demonym.',
    {
      demonym: z.string().describe("Demonym to search for (e.g., 'Brazilian', 'Japanese')"),
      fields: z.array(z.string()).optional().describe('Specific fields to return'),
    },
    async ({ demonym, fields }) => {
      const countries = await client.getByDemonym(demonym, fields);
      const limited = countries.slice(0, config.maxResults);
      const text = `Countries with demonym "${demonym}" (${countries.length} result${countries.length !== 1 ? 's' : ''})\n\n${CountryFormatter.formatCountryList(limited)}`;
      return { content: [{ type: 'text', text }] };
    },
  );
}
