import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext): void {
  const serverPath = path.join(context.extensionPath, 'dist', 'server.js');
  const outputChannel = vscode.window.createOutputChannel('Countries MCP');
  context.subscriptions.push(outputChannel);

  // Register MCP server definition provider
  const provider: vscode.McpServerDefinitionProvider = {
    provideMcpServerDefinitions(_token: vscode.CancellationToken) {
      const env = buildEnvFromConfig(vscode.workspace.getConfiguration('restcountriesMcp'));
      return [
        new vscode.McpStdioServerDefinition(
          'Countries',
          process.execPath,
          [serverPath],
          env,
          context.extension.packageJSON.version,
        ),
      ];
    },
  };

  context.subscriptions.push(
    vscode.lm.registerMcpServerDefinitionProvider('countries-mcp-server', provider),
  );

  // Watch for config changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('restcountriesMcp')) {
        vscode.window.showInformationMessage(
          'Countries MCP configuration changed. Restart the MCP server for changes to take effect.',
        );
      }
    }),
  );
}

export function deactivate(): void {}

function buildEnvFromConfig(config: vscode.WorkspaceConfiguration): Record<string, string> {
  const env: Record<string, string> = {};

  const baseUrl = config.get<string>('baseUrl');
  if (baseUrl) env.RESTCOUNTRIES_MCP_BASE_URL = baseUrl;

  const cacheTtlMs = config.get<number>('cacheTtlMs');
  if (cacheTtlMs !== undefined) env.RESTCOUNTRIES_MCP_CACHE_TTL_MS = String(cacheTtlMs);

  const cacheEnabled = config.get<boolean>('cacheEnabled');
  if (cacheEnabled !== undefined) env.RESTCOUNTRIES_MCP_CACHE_ENABLED = String(cacheEnabled);

  const timeoutMs = config.get<number>('timeoutMs');
  if (timeoutMs !== undefined) env.RESTCOUNTRIES_MCP_TIMEOUT_MS = String(timeoutMs);

  const maxResults = config.get<number>('maxResults');
  if (maxResults !== undefined) env.RESTCOUNTRIES_MCP_MAX_RESULTS = String(maxResults);

  const defaultFields = config.get<string>('defaultFields');
  if (defaultFields) env.RESTCOUNTRIES_MCP_DEFAULT_FIELDS = defaultFields;

  const retryCount = config.get<number>('retryCount');
  if (retryCount !== undefined) env.RESTCOUNTRIES_MCP_RETRY_COUNT = String(retryCount);

  return env;
}
