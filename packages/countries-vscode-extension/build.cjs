const esbuild = require('esbuild');
const path = require('path');

async function build() {
  // Build the extension (CJS, vscode external)
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src', 'extension.ts')],
    bundle: true,
    outfile: path.join(__dirname, 'dist', 'extension.js'),
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcemap: true,
  });

  // Bundle the MCP server (CJS, fully self-contained)
  await esbuild.build({
    entryPoints: [path.join(__dirname, '..', 'countries-mcp-server', 'src', 'index.ts')],
    bundle: true,
    outfile: path.join(__dirname, 'dist', 'server.js'),
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcemap: true,
  });

  console.log('Build completed successfully');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
