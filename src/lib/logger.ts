/**
 * Structured logging utility for observability
 * Logs in JSON format with consistent schema
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = (import.meta as any).env.DEV !== false;

  private createEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
      ...(error && {
        error: {
          message: error.message,
          ...(this.isDevelopment && { stack: error.stack }),
        },
      }),
    };
  }

  private output(entry: LogEntry) {
    const json = JSON.stringify(entry);

    if (entry.level === 'ERROR') {
      console.error(json);
    } else if (entry.level === 'WARN') {
      console.warn(json);
    } else if (entry.level === 'DEBUG' && this.isDevelopment) {
      console.debug(json);
    } else {
      console.log(json);
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.output(this.createEntry('DEBUG', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    this.output(this.createEntry('INFO', message, context));
  }

  warn(message: string, context?: LogContext) {
    this.output(this.createEntry('WARN', message, context));
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.output(this.createEntry('ERROR', message, context, error));
  }
}

export const logger = new Logger();
