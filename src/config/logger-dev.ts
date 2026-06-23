const logger = {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  debug: (...args: any[]) => console.debug('[DEBUG]', ...args),
  fatal: (...args: any[]) => console.error('[FATAL]', ...args),
  trace: (...args: any[]) => console.debug('[TRACE]', ...args),
};

export default logger;
