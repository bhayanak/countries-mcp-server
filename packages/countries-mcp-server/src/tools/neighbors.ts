import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RestCountriesClient } from '../api/client.js';
import { CountryFormatter } from '../utils/formatter.js';

export function registerNeighborTools(server: McpServer, client: RestCountriesClient) {
  server.tool(
    'countries_get_borders',
    'Find all countries that share a border with the specified country.',
    {
      code: z.string().describe('Country code (cca2 or cca3) to find borders for'),
      fields: z.array(z.string()).optional().describe('Specific fields to return'),
    },
    async ({ code, fields }) => {
      const country = await client.getByCode(code);
      if (!country.borders || country.borders.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: CountryFormatter.formatBorders(country, []),
            },
          ],
        };
      }
      const borders = await client.getByCodes(country.borders, fields);
      const text = CountryFormatter.formatBorders(country, borders);
      return { content: [{ type: 'text', text }] };
    },
  );
}
