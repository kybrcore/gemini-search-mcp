import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const envPath = resolve(__dirname, '..', '.env');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env file is optional
  }
}

loadEnv();

if (
  !process.env.GEMINI_API_KEY &&
  !process.env.VERTEX_EXPRESS_MODE_API_KEY &&
  !process.env.USE_VERTEX_AI
) {
  console.error(
    'Error: Set one of GEMINI_API_KEY, VERTEX_EXPRESS_MODE_API_KEY, or USE_VERTEX_AI + GOOGLE_CLOUD_PROJECT.',
  );
  process.exit(1);
}

async function main() {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js'],
    env: { ...process.env },
  });

  const client = new Client({ name: 'test', version: '1.0' });
  await client.connect(transport);

  const tools = await client.listTools();
  console.log('Tools:', JSON.stringify(tools.tools.map(t => t.name)));

  const result = await client.callTool({
    name: 'gemini_search',
    arguments: { query: 'MCP Model Context Protocol latest news' },
  });
  console.log('Result:', JSON.stringify(result, null, 2));

  await client.close();
}

main().catch(console.error);
