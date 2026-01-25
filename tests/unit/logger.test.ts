/**
 * Example unit test for logger
 * Demonstrates test-first development approach
 */

import { describe, it, expect, vi } from 'vitest';
import { logger } from '@lib/logger';

describe('logger', () => {
  it('should log info messages', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('Test message', { context: 'value' });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('"level":"INFO"'),
    );

    consoleSpy.mockRestore();
  });

  it('should log error messages with stack trace', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Test error');

    logger.error('Error occurred', error, { context: 'value' });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('"level":"ERROR"'),
    );

    consoleErrorSpy.mockRestore();
  });

  it('should format logs as JSON', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('Test', { foo: 'bar' });

    const call = consoleSpy.mock.calls[0][0] as string;
    expect(() => JSON.parse(call)).not.toThrow();

    consoleSpy.mockRestore();
  });
});
