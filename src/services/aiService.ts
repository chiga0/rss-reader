/**
 * AI Service
 * Provides translation and summarization using OpenAI-compatible APIs
 */

import type { UserSettings } from '@models/Feed';

function getApiBase(settings: UserSettings): string {
  if (settings.aiProvider === 'custom' && settings.aiBaseUrl) {
    return settings.aiBaseUrl.replace(/\/$/, '');
  }
  return 'https://api.openai.com/v1';
}

function getModel(settings: UserSettings): string {
  return settings.aiModel || 'gpt-4o-mini';
}

async function chatCompletion(
  settings: UserSettings,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const apiKey = settings.aiApiKey;
  if (!apiKey) {
    throw new Error('AI API key is not configured. Please set it in Settings.');
  }

  const base = getApiBase(settings);
  const model = getModel(settings);

  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`AI API request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI API returned an unexpected response format.');
  }
  return content as string;
}

/**
 * Translate the given text to the target language (defaults to Chinese).
 */
export async function translateText(
  text: string,
  settings: UserSettings,
  targetLanguage = '中文',
): Promise<string> {
  const systemPrompt = `You are a professional translator. Translate the following text to ${targetLanguage}. Return only the translated text without any additional explanation.`;
  return chatCompletion(settings, systemPrompt, text);
}

/**
 * Summarize the given article text.
 */
export async function summarizeText(
  text: string,
  settings: UserSettings,
): Promise<string> {
  const systemPrompt =
    'You are a helpful assistant that summarizes articles concisely. Provide a clear and concise summary of the main points in 3-5 sentences. Respond in the same language as the article.';
  return chatCompletion(settings, systemPrompt, text);
}
