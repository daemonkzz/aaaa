type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  context?: string;
}

const isDev = import.meta.env.DEV;

// Log levels priority
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level to display (can be configured)
const MIN_LOG_LEVEL: LogLevel = isDev ? 'debug' : 'warn';

/**
 * Check if log level should be displayed
 */
const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
};

/**
 * Format log entry for console
 */
const formatLogEntry = (entry: LogEntry): string => {
  const contextStr = entry.context ? `[${entry.context}]` : '';
  return `${entry.timestamp} ${entry.level.toUpperCase()} ${contextStr} ${entry.message}`;
};

/**
 * Create a log entry
 */
const createLogEntry = (level: LogLevel, message: string, data?: unknown, context?: string): LogEntry => {
  return {
    level,
    message,
    data,
    timestamp: new Date().toISOString(),
    context,
  };
};

/**
 * Log to console
 */
const logToConsole = (entry: LogEntry): void => {
  if (!shouldLog(entry.level)) return;

  const formattedMessage = formatLogEntry(entry);

  switch (entry.level) {
    case 'debug':
      console.debug(formattedMessage, entry.data ?? '');
      break;
    case 'info':
      console.info(formattedMessage, entry.data ?? '');
      break;
    case 'warn':
      console.warn(formattedMessage, entry.data ?? '');
      break;
    case 'error':
      console.error(formattedMessage, entry.data ?? '');
      break;
  }
};

/**
 * Logger utility for consistent logging across the app
 */
export const logger = {
  /**
   * Debug level logging (dev only)
   */
  debug: (message: string, data?: unknown, context?: string): void => {
    const entry = createLogEntry('debug', message, data, context);
    logToConsole(entry);
  },

  /**
   * Info level logging
   */
  info: (message: string, data?: unknown, context?: string): void => {
    const entry = createLogEntry('info', message, data, context);
    logToConsole(entry);
  },

  /**
   * Warning level logging
   */
  warn: (message: string, data?: unknown, context?: string): void => {
    const entry = createLogEntry('warn', message, data, context);
    logToConsole(entry);
  },

  /**
   * Error level logging
   */
  error: (message: string, data?: unknown, context?: string): void => {
    const entry = createLogEntry('error', message, data, context);
    logToConsole(entry);
  },

  /**
   * Create a scoped logger with a fixed context
   */
  scope: (context: string) => ({
    debug: (message: string, data?: unknown) => logger.debug(message, data, context),
    info: (message: string, data?: unknown) => logger.info(message, data, context),
    warn: (message: string, data?: unknown) => logger.warn(message, data, context),
    error: (message: string, data?: unknown) => logger.error(message, data, context),
  }),
};

export default logger;
