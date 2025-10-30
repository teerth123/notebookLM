import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

type GeminiModel = {
  name: string;
  displayName?: string;
  supportedGenerationMethods?: string[];
};

let cachedModel: string | null = null;
const RETRYABLE_STATUS_CODES = new Set([429, 503]);
const MAX_RETRIES = 3;

function normalizeModelName(model: string): string {
  return model.startsWith('models/') ? model : `models/${model}`;
}

async function listAvailableModels(): Promise<string[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to list Gemini models: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as { models?: GeminiModel[] };
  const models = data.models ?? [];

  return models
    .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
    .map((model) => model.name);
}

async function resolveModelName(): Promise<string> {
  if (cachedModel) {
    return cachedModel;
  }

  if (GEMINI_MODEL) {
    const normalized = normalizeModelName(GEMINI_MODEL);
    cachedModel = normalized;
    return normalized;
  }

  const availableModels = await listAvailableModels();

  if (availableModels.length === 0) {
    throw new Error('No Gemini models available that support generateContent');
  }

  // Prefer 1.5 flash, then pro, fall back to first available
  const preferredOrder = [
    'models/gemini-2.5-flash',
    'models/gemini-2.0-flash',
    'models/gemini-1.5-flash-8b',
    'models/gemini-1.5-flash',
    'models/gemini-1.5-flash-latest',
    'models/gemini-1.5-pro',
    'models/gemini-1.5-pro-latest',
    'models/gemini-pro',
  ];

  const selected = preferredOrder.find((model) => availableModels.includes(model)) ?? availableModels[0];
  cachedModel = selected;
  return selected;
}

export async function generateGeminiResponse(prompt: string): Promise<string> {
  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  };

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    const modelName = await resolveModelName();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (response.status === 404) {
      const errorText = await response.text();

      if (GEMINI_MODEL) {
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      // Model might have been deprecated, refresh cache once
      cachedModel = null;
      continue;
    }

    if (!response.ok) {
      const errorText = await response.text();

      if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === MAX_RETRIES - 1) {
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const retryAfter = parseRetryAfterSeconds(response.headers.get('Retry-After'));
      await waitForBackoff(attempt, retryAfter);
      continue;
    }

    const data = (await response.json()) as any;
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Gemini API returned an empty response');
    }

    return text;
  }

  throw new Error('Gemini API failed after retries');
}

function parseRetryAfterSeconds(headerValue: string | null): number | null {
  if (!headerValue) {
    return null;
  }

  const seconds = Number(headerValue);

  if (!Number.isNaN(seconds)) {
    return seconds;
  }

  const retryDate = Date.parse(headerValue);
  if (Number.isNaN(retryDate)) {
    return null;
  }

  const diffMs = retryDate - Date.now();
  return diffMs > 0 ? diffMs / 1000 : 0;
}

async function waitForBackoff(attempt: number, retryAfterSeconds: number | null): Promise<void> {
  const baseDelayMs = 1000;
  const backoffMs = retryAfterSeconds ? retryAfterSeconds * 1000 : baseDelayMs * 2 ** attempt;

  // Respectable pause before retrying the API.
  await new Promise((resolve) => setTimeout(resolve, Math.min(backoffMs, 10000)));
}
