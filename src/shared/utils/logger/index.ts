import { LogLevel, LogEntry } from './types';

class Logger {
  private log(level: LogLevel, category: string, message: string, context?: Record<string, unknown>, error?: unknown) {
    const configuredLevel = process.env.LOG_LEVEL || 'INFO';
    const levels: Record<LogLevel, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

    if (levels[level] < levels[configuredLevel as LogLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
    };
    if (context) entry.context = context;
    if (error) entry.error = error instanceof Error ? { message: error.message, stack: error.stack } : error;

    const output = JSON.stringify(entry);

    switch (level) {
      case 'DEBUG':
      case 'INFO':
        console.log(output); // Production logging goes to stdout
        break;
      case 'WARN':
        console.warn(output);
        break;
      case 'ERROR':
        console.error(output);
        break;
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('DEBUG', 'APP', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('INFO', 'APP', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('WARN', 'APP', message, context);
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    this.log('ERROR', 'APP', message, context, error);
  }

  audit(message: string, context?: Record<string, unknown>) {
    this.log('INFO', 'AUDIT', message, context);
  }

  security(message: string, context?: Record<string, unknown>) {
    this.log('INFO', 'SECURITY', message, context);
  }
}

export const logger = new Logger();
