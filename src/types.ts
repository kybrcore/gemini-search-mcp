import type { GroundingChunk, GroundingSupport } from '@google/genai';

export interface Config {
  geminiApiKey?: string;
  vertexExpressApiKey?: string;
  vertexProject?: string;
  vertexLocation: string;
  useVertexAi: boolean;
  keyFile?: string;
  model: string;
}

export interface SearchResult {
  text: string;
  sources?: GroundingChunk[];
  groundingSupports?: GroundingSupport[];
}
