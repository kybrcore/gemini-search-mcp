import { GoogleGenAI } from '@google/genai';
import type { Config } from '../types.js';
import { loadConfig } from './config.js';

let clientInstance: GoogleGenAI | null = null;

export function createClient(config?: Config): GoogleGenAI {
  if (clientInstance) return clientInstance;

  const c = config || loadConfig();

  if (c.useVertexAi && c.vertexProject) {
    const opts = {
      vertexai: true,
      project: c.vertexProject,
      location: c.vertexLocation,
      ...(c.keyFile && { googleAuthOptions: { keyFile: c.keyFile } }),
    };

    if (c.keyFile) {
      console.error(`Using Vertex AI with service account key: ${c.keyFile}`);
    } else {
      console.error(
        `Using Vertex AI with ADC (project: ${c.vertexProject}, location: ${c.vertexLocation})...`,
      );
    }

    clientInstance = new GoogleGenAI(opts);
  } else if (c.useVertexAi && c.vertexExpressApiKey) {
    console.error('Using Vertex AI Express Mode with API key...');
    clientInstance = new GoogleGenAI({ vertexai: true, apiKey: c.vertexExpressApiKey });
  } else if (c.geminiApiKey) {
    console.error('Using Gemini API key (AI Studio)...');
    clientInstance = new GoogleGenAI({ apiKey: c.geminiApiKey });
  } else {
    throw new Error(
      'Authentication required. Set one of:\n' +
        '  - GEMINI_API_KEY (AI Studio Gemini API key)\n' +
        '  - VERTEX_EXPRESS_MODE_API_KEY (Vertex AI Express Mode API key)\n' +
        '  - USE_VERTEX_AI=true + GOOGLE_CLOUD_PROJECT (Vertex AI with ADC)\n' +
        '  - USE_VERTEX_AI=true + GOOGLE_CLOUD_PROJECT + GOOGLE_APPLICATION_CREDENTIALS (Vertex AI with service account JSON)\n' +
        'Get Gemini API key from https://aistudio.google.com/api-keys\n' +
        'Get Vertex Express API key from https://console.cloud.google.com/agent-platform/overview',
    );
  }

  return clientInstance;
}

export function resetClient(): void {
  clientInstance = null;
}
