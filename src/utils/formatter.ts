import type { SearchResult } from '../types.js';

export function formatSearchResult(
  query: string,
  result: SearchResult,
): string {
  if (!result.text || !result.text.trim()) {
    return `No search results or information found for query: "${query}"`;
  }

  let modifiedResponseText = result.text;
  const sourceListFormatted: string[] = [];

  if (result.sources && result.sources.length > 0) {
    result.sources.forEach((source, index) => {
      const title = source.web?.title || 'Untitled';
      const uri = source.web?.uri || 'No URI';
      sourceListFormatted.push(`[${index + 1}] ${title} (${uri})`);
    });

    if (result.groundingSupports && result.groundingSupports.length > 0) {
      const insertions: Array<{ index: number; marker: string }> = [];
      result.groundingSupports.forEach((support) => {
        if (support.segment && support.groundingChunkIndices) {
          const citationMarker = support.groundingChunkIndices
            .map((chunkIndex) => `[${chunkIndex + 1}]`)
            .join('');
          insertions.push({
            index: support.segment.endIndex ?? 0,
            marker: citationMarker,
          });
        }
      });

      insertions.sort((a, b) => b.index - a.index);

      const encoder = new TextEncoder();
      const responseBytes = encoder.encode(modifiedResponseText);
      const parts: Uint8Array[] = [];
      let lastIndex = responseBytes.length;
      for (const ins of insertions) {
        const pos = Math.min(ins.index, lastIndex);
        parts.unshift(responseBytes.subarray(pos, lastIndex));
        parts.unshift(encoder.encode(ins.marker));
        lastIndex = pos;
      }
      parts.unshift(responseBytes.subarray(0, lastIndex));

      const totalLength = parts.reduce(
        (sum, part) => sum + part.length,
        0,
      );
      const finalBytes = new Uint8Array(totalLength);
      let offset = 0;
      for (const part of parts) {
        finalBytes.set(part, offset);
        offset += part.length;
      }
      modifiedResponseText = new TextDecoder().decode(finalBytes);
    }

    if (sourceListFormatted.length > 0) {
      modifiedResponseText +=
        '\n\nSources:\n' + sourceListFormatted.join('\n');
    }
  }

  return `Web search results for "${query}":\n\n${modifiedResponseText}`;
}
