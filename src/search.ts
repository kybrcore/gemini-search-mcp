import type { GroundingMetadata } from '@google/genai';
import type { SearchResult } from './types.js';
import { loadConfig } from './utils/config.js';
import { createClient } from './utils/client.js';

export async function search(query: string): Promise<SearchResult> {
  const config = loadConfig();
  const client = createClient(config);

  const response = await client.models.generateContent({
    model: config.model,
    contents: [{ role: 'user', parts: [{ text: query }] }],
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const responseText =
    response.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || '')
      .join('') || '';

  const groundingMetadata = response.candidates?.[0]?.groundingMetadata as
    | GroundingMetadata
    | undefined;

  return {
    text: responseText,
    sources: groundingMetadata?.groundingChunks,
    groundingSupports: groundingMetadata?.groundingSupports,
  };
}
