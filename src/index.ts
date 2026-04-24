#!/usr/bin/env node

import { readFileSync } from 'fs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { search } from './search.js';
import { formatSearchResult } from './utils/formatter.js';
import { loadConfig } from './utils/config.js';
import { createClient } from './utils/client.js';
import { handleToolError } from './utils/error.js';

function getPackageVersion(): string {
  let cachedVersion: string | undefined;
  if (cachedVersion) return cachedVersion;
  try {
    const pkg = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf-8'),
    );
    cachedVersion = (pkg.version as string) || '0.0.0';
  } catch {
    cachedVersion = '0.0.0';
  }
  return cachedVersion;
}

const server = new McpServer(
  {
    name: 'gemini-search-mcp',
    version: getPackageVersion(),
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.registerTool(
  'gemini_search',
  {
    description:
      'Search the web using Google Search grounding via the Gemini API. Best for broad or open-ended queries where an AI-synthesized answer with citations is more useful than a list of links, such as news, background research, historical topics, and general fact-finding. Less suitable for finding exact official docs, API references, specific webpages, or exhaustive raw search results, where a traditional web search tool is usually better.',
    inputSchema: {
      query: z.string().min(1).describe('The search query to find information on the web.'),
    },
  },
  async (args) => {
    return handleToolError(async () => {
      const result = await search(args.query);
      const resultText = formatSearchResult(args.query, result);

      return {
        content: [
          {
            type: 'text',
            text: resultText,
          },
        ],
      };
    });
  },
);

async function main() {
  const shutdown = async () => {
    try {
      await server.close();
    } catch {
      // best-effort close
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  loadConfig();
  createClient();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Gemini Search MCP server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
