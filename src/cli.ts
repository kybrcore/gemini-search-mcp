#!/usr/bin/env node

import { search } from './search.js';
import { formatSearchResult } from './utils/formatter.js';
import { loadConfig } from './utils/config.js';
import { createClient } from './utils/client.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: gemini-search <query>');
    process.exit(1);
  }

  const query = args.join(' ');

  try {
    loadConfig();
    createClient();
    const result = await search(query);
    console.log(formatSearchResult(query, result));
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(`Error: ${errorMessage}`);
    process.exit(1);
  }
}

main();
