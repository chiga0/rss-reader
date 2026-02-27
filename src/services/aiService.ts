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
  signal?: AbortSignal;
}

/**
 * Call the /api/chat proxy endpoint.
 * When `stream` is true and `onChunk` is provided, parses the SSE stream
 * and invokes `onChunk` for every content delta, then returns the full text.
 * Otherwise returns the complete response text at once.
 */
async function chatCompletion(options: ChatOptions): Promise<string> {
  const { systemPrompt, userMessage, stream = false, onChunk, signal } = options;
  const useStream = stream && !!onChunk;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userMessage,
      systemPrompt,
      stream: useStream,
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`AI API request failed (${response.status}): ${errorText}`);
  }

  if (useStream) {
    return parseSSEStream(response, onChunk, signal);
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
 * Respects an optional AbortSignal to stop reading mid-stream.
 */
async function parseSSEStream(
  response: Response,
  onChunk: OnChunkCallback,
  signal?: AbortSignal,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  // Cancel the underlying reader when the signal fires so reader.read() resolves
  const abortHandler = () => { reader.cancel().catch((_err) => { /* ignore cancel errors */ }); };
  signal?.addEventListener('abort', abortHandler);
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullContent = '';

  try {
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
  } finally {
    signal?.removeEventListener('abort', abortHandler);
  }

  return fullContent;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Maximum number of characters sent to the summarize endpoint for efficiency. */
const MAX_SUMMARY_INPUT_LENGTH = 4000;

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
  signal?: AbortSignal,
): Promise<string> {
  const systemPrompt = `You are a professional translator. Translate the following text to ${targetLanguage}. Return only the translated text without any additional explanation.`;
  return chatCompletion({
    systemPrompt,
    userMessage: text,
    stream: !!onChunk,
    onChunk,
    signal,
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
  signal?: AbortSignal,
): Promise<string> {
  const systemPrompt =
    'You are a helpful assistant that summarizes articles concisely. Provide a clear and concise summary of the main points in 3-5 sentences. Respond in the same language as the article.';
  // Truncate long inputs to improve response speed; 4000 chars is typically sufficient
  const truncated = text.length > MAX_SUMMARY_INPUT_LENGTH ? text.slice(0, MAX_SUMMARY_INPUT_LENGTH) : text;
  return chatCompletion({
    systemPrompt,
    userMessage: truncated,
    stream: !!onChunk,
    onChunk,
    signal,
  });
}
