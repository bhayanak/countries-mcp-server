import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RestCountriesClient } from '../api/client.js';
import { CountryFormatter } from '../utils/formatter.js';

export function registerCompareTools(server: McpServer, client: RestCountriesClient) {
  server.tool(
    'countries_compare',
    'Compare 2-5 countries side-by-side across key metrics.',
    {
      codes: z.array(z.string()).min(2).max(5).describe('Country codes to compare (cca2 or cca3)'),
      metrics: z
        .array(z.string())
        .optional()
        .default(['population', 'area', 'currencies', 'languages', 'timezones'])
        .describe('Metrics to compare'),
    },
    async ({ codes, metrics }) => {
      const countries = await client.getByCodes(codes);
      const text = `Country Comparison (${countries.length} countries)\n\n${CountryFormatter.formatComparison(countries, metrics)}`;
      return { content: [{ type: 'text', text }] };
    },
  );
}
