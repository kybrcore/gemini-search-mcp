import type { Config } from '../types.js';

export const DEFAULT_MODEL = 'gemini-2.5-flash';

let cachedConfig: Config | null = null;

export function loadConfig(): Config {
  if (cachedConfig) return cachedConfig;

  cachedConfig = {
    geminiApiKey: process.env.GEMINI_API_KEY,
    vertexExpressApiKey: process.env.VERTEX_EXPRESS_MODE_API_KEY,
    vertexProject: process.env.GOOGLE_CLOUD_PROJECT,
    vertexLocation: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    useVertexAi:
      process.env.USE_VERTEX_AI === 'true' ||
      !!process.env.VERTEX_EXPRESS_MODE_API_KEY,
    keyFile:
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.VERTEX_AI_KEY_FILE,
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
  };

  return cachedConfig;
}

export function resetConfig(): void {
  cachedConfig = null;
}
