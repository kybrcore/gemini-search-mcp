import assert from 'assert';
import { formatSearchResult } from '../src/utils/formatter.js';
import { handleToolError } from '../src/utils/error.js';
import type { SearchResult } from '../src/types.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(() => fn())
    .then(() => {
      passed++;
      console.log(`  ✓ ${name}`);
    })
    .catch((err) => {
      failed++;
      console.error(`  ✗ ${name}`);
      console.error(`    ${err.message}`);
    });
}

function makeResult(
  text: string,
  sources?: SearchResult['sources'],
  groundingSupports?: SearchResult['groundingSupports'],
): SearchResult {
  return { text, sources, groundingSupports };
}

async function runFormatterTests() {
  console.log('\nformatSearchResult:');

  await test('empty result text', () => {
    const out = formatSearchResult('test', makeResult(''));
    assert.ok(out.includes('No search results'));
    assert.ok(out.includes('"test"'));
  });

  await test('whitespace-only result text', () => {
    const out = formatSearchResult('test', makeResult('   '));
    assert.ok(out.includes('No search results'));
  });

  await test('plain text without sources', () => {
    const out = formatSearchResult('hello', makeResult('Hello world'));
    assert.strictEqual(out, 'Web search results for "hello":\n\nHello world');
  });

  await test('sources list without grounding supports', () => {
    const sources = [
      { web: { title: 'Wikipedia', uri: 'https://wikipedia.org' } },
      { web: { title: 'Google', uri: 'https://google.com' } },
    ];
    const out = formatSearchResult('test', makeResult('Some text', sources));
    assert.ok(out.includes('[1] Wikipedia (https://wikipedia.org)'));
    assert.ok(out.includes('[2] Google (https://google.com)'));
    assert.ok(out.includes('Sources:'));
  });

  await test('source with missing web fields', () => {
    const sources = [{ web: {} }, {} as any];
    const out = formatSearchResult('test', makeResult('text', sources));
    assert.ok(out.includes('[1] Untitled (No URI)'));
    assert.ok(out.includes('[2] Untitled (No URI)'));
  });

  await test('citation insertion at end of text', () => {
    const sources = [
      { web: { title: 'A', uri: 'https://a.com' } },
    ];
    const groundingSupports = [
      {
        segment: { startIndex: 0, endIndex: 5 },
        groundingChunkIndices: [0],
      },
    ];
    const out = formatSearchResult('q', makeResult('Hello', sources, groundingSupports));
    assert.ok(out.includes('Hello[1]'));
    assert.ok(out.includes('[1] A (https://a.com)'));
  });

  await test('citation insertion with CJK characters (byte-level)', () => {
    const sources = [
      { web: { title: '中文', uri: 'https://cn.com' } },
    ];
    const cjkText = '你好世界';
    const endIndex = new TextEncoder().encode(cjkText).length;
    const groundingSupports = [
      {
        segment: { startIndex: 0, endIndex },
        groundingChunkIndices: [0],
      },
    ];
    const out = formatSearchResult('q', makeResult(cjkText, sources, groundingSupports));
    assert.ok(out.includes('你好世界[1]'));
  });

  await test('multiple citations on different segments', () => {
    const sources = [
      { web: { title: 'A', uri: 'https://a.com' } },
      { web: { title: 'B', uri: 'https://b.com' } },
    ];
    const groundingSupports = [
      {
        segment: { startIndex: 0, endIndex: 5 },
        groundingChunkIndices: [0],
      },
      {
        segment: { startIndex: 6, endIndex: 11 },
        groundingChunkIndices: [1],
      },
    ];
    const out = formatSearchResult('q', makeResult('Hello World', sources, groundingSupports));
    assert.ok(out.includes('Hello[1] World[2]'));
  });

  await test('multi-chunk citation on single segment', () => {
    const sources = [
      { web: { title: 'A', uri: 'https://a.com' } },
      { web: { title: 'B', uri: 'https://b.com' } },
    ];
    const groundingSupports = [
      {
        segment: { startIndex: 0, endIndex: 5 },
        groundingChunkIndices: [0, 1],
      },
    ];
    const out = formatSearchResult('q', makeResult('Hello', sources, groundingSupports));
    assert.ok(out.includes('Hello[1][2]'));
  });

  await test('segment with endIndex 0 does not corrupt output', () => {
    const sources = [
      { web: { title: 'A', uri: 'https://a.com' } },
    ];
    const groundingSupports = [
      {
        segment: { startIndex: 0, endIndex: 0 },
        groundingChunkIndices: [0],
      },
    ];
    const out = formatSearchResult('q', makeResult('Hello', sources, groundingSupports));
    assert.ok(out.includes('[1]'));
  });
}

async function runToolWrapperTests() {
  console.log('\nhandleToolError:');

  await test('returns successful result', async () => {
    const result = await handleToolError(async () => ({
      content: [{ type: 'text' as const, text: 'ok' }],
    }));
    assert.deepStrictEqual(result.content, [{ type: 'text', text: 'ok' }]);
    assert.strictEqual(result.isError, undefined);
  });

  await test('catches Error and returns error result', async () => {
    const result = await handleToolError(async () => {
      throw new Error('boom');
    });
    assert.strictEqual(result.isError, true);
    assert.ok((result.content[0] as any).text.includes('boom'));
  });

  await test('catchs non-Error and returns stringified', async () => {
    const result = await handleToolError(async () => {
      throw 'string error';
    });
    assert.strictEqual(result.isError, true);
    assert.ok((result.content[0] as any).text.includes('string error'));
  });
}

async function main() {
  console.log('Running unit tests...\n');

  await runFormatterTests();
  await runToolWrapperTests();

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
