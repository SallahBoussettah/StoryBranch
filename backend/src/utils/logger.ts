/**
 * Logger utility for consistent logging throughout the application
 */
export class Logger {
  private static formatMessage(message: string): string {
    return `[${new Date().toISOString()}] ${message}`;
  }

  static info(message: string, ...args: any[]): void {
    console.info(Logger.formatMessage(`INFO: ${message}`), ...args);
  }

  static error(message: string, error?: any): void {
    console.error(Logger.formatMessage(`ERROR: ${message}`), error || '');
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(Logger.formatMessage(`WARN: ${message}`), ...args);
  }

  static debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(Logger.formatMessage(`DEBUG: ${message}`), ...args);
    }
  }
}