import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RestCountriesConfig } from './api/types.js';
import { RestCountriesClient } from './api/client.js';
import { registerLookupTools } from './tools/lookup.js';
import { registerSearchTools } from './tools/search.js';
import { registerFilterTools } from './tools/filter.js';
import { registerBulkTools } from './tools/bulk.js';
import { registerCompareTools } from './tools/compare.js';
import { registerNeighborTools } from './tools/neighbors.js';

export function createServer(config: RestCountriesConfig): McpServer {
  const server = new McpServer({
    name: 'countries-mcp-server',
    version: '0.1.0',
  });

  const client = new RestCountriesClient(config);

  registerLookupTools(server, client, config);
  registerSearchTools(server, client, config);
  registerFilterTools(server, client, config);
  registerBulkTools(server, client, config);
  registerCompareTools(server, client);
  registerNeighborTools(server, client);

  return server;
}
