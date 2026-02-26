/**
 * AI Service
 * Provides translation and summarization via the /api/chat proxy endpoint.
 * - Production: Netlify Function (netlify/functions/chat.js)
 * - Development: Vite dev proxy middleware (vite.config.ts)
 *
 * Supports both streaming (SSE) and non-streaming modes.
 * API credentials are managed server-side via environment variables.
 */

import type { UserSettings } from '@models/Feed';

/** Callback invoked with each incremental text chunk during streaming. */
export type OnChunkCallback = (chunk: string) => void;

interface ChatOptions {
  systemPrompt: string;
  userMessage: string;
  stream?: boolean;
  onChunk?: OnChunkCallback;
}

/**
 * Call the /api/chat proxy endpoint.
 * When `stream` is true and `onChunk` is provided, parses the SSE stream
 * and invokes `onChunk` for every content delta, then returns the full text.
 * Otherwise returns the complete response text at once.
 */
async function chatCompletion(options: ChatOptions): Promise<string> {
  const { systemPrompt, userMessage, stream = false, onChunk } = options;
  const useStream = stream && !!onChunk;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userMessage,
      systemPrompt,
      stream: useStream,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`AI API request failed (${response.status}): ${errorText}`);
  }

  if (useStream) {
    return parseSSEStream(response, onChunk);
  }

  // Non-streaming: standard OpenAI JSON response
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI API returned an unexpected response format.');
  }
  return content as string;
}

/**
 * Parse an SSE (Server-Sent Events) stream from the response body.
 * Calls `onChunk` for each content delta and returns the accumulated full text.
 */
async function parseSSEStream(
  response: Response,
  onChunk: OnChunkCallback,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullContent = '';

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Split by newline; the last element may be incomplete, keep it in buffer
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;

      const dataStr = line.slice(6).trim();
      if (dataStr === '[DONE]') continue;

      try {
        const data = JSON.parse(dataStr);
        const content: string = data.choices?.[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          onChunk(content);
        }
      } catch {
        // Skip malformed JSON lines
      }
    }
  }

  return fullContent;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Translate the given text to the target language (defaults to Chinese).
 * Pass `onChunk` to receive incremental streaming output.
 *
 * @param text         - Source text to translate
 * @param _settings    - UserSettings (kept for API compatibility; credentials are server-side)
 * @param targetLanguage - Target language name, e.g. '中文', 'English'
 * @param onChunk      - Optional streaming callback
 */
export async function translateText(
  text: string,
  _settings: UserSettings,
  targetLanguage = '中文',
  onChunk?: OnChunkCallback,
): Promise<string> {
  const systemPrompt = `You are a professional translator. Translate the following text to ${targetLanguage}. Return only the translated text without any additional explanation.`;
  return chatCompletion({
    systemPrompt,
    userMessage: text,
    stream: !!onChunk,
    onChunk,
  });
}

/**
 * Summarize the given article text.
 * Pass `onChunk` to receive incremental streaming output.
 *
 * @param text      - Article text to summarize
 * @param _settings - UserSettings (kept for API compatibility; credentials are server-side)
 * @param onChunk   - Optional streaming callback
 */
export async function summarizeText(
  text: string,
  _settings: UserSettings,
  onChunk?: OnChunkCallback,
): Promise<string> {
  const systemPrompt =
    'You are a helpful assistant that summarizes articles concisely. Provide a clear and concise summary of the main points in 3-5 sentences. Respond in the same language as the article.';
  return chatCompletion({
    systemPrompt,
    userMessage: text,
    stream: !!onChunk,
    onChunk,
  });
}
