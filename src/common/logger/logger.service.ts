import { Logger, Injectable } from '@nestjs/common';

/**
 * Custom logger service with colorized output and custom formatting.
 * Only the log, error, warn, and debug methods are functional.
 */
@Injectable()
export class CustomLogger extends Logger {
  private readonly colors: { [key: string]: string } = {
    log: '\x1b[36m', // cyan
    error: '\x1b[31m', // red
    warn: '\x1b[33m', // yellow
    debug: '\x1b[32m', // green
    reset: '\x1b[0m', // reset
  };

  /**
   * Formats the log message with colorization and additional information.
   * @param level - The log level.
   * @param message - The main log message.
   * @param context - The context of the log message.
   * @param additionalInfo - Additional information to be included in the log message.
   * @returns The formatted log message.
   */
  private formatMessage(
    level: keyof typeof this.colors,
    message: string,
    context?: string,
    additionalInfo?: any,
  ): string {
    const timestamp = new Date().toISOString();
    const pid = process.pid;
    const contextInfo = context ? ` [${context}]` : '';
    const additionalInfoStr = additionalInfo
      ? `\n\n${JSON.stringify(additionalInfo)}\n`
      : '';
    const levelStr = level.toString(); // Ensuring level is treated as a string
    let formattedLog = `[${pid}] - ${this.colors[levelStr]}[${levelStr.toUpperCase()}]${this.colors.reset} - [${timestamp}]: ${this.colors[levelStr]}${message}${this.colors.reset}`;

    if (contextInfo) {
      formattedLog = formattedLog.concat(contextInfo);
    }

    if (additionalInfo) {
      formattedLog = formattedLog.concat(additionalInfoStr);
    }

    return formattedLog;
  }

  /**
   * Logs a message with the level 'log' (color: cyan).
   * @param message - The main log message.
   * @param context - The context of the log message.
   * @param additionalInfo - Additional information to be included in the log message.
   */
  log(message: string, context?: string, additionalInfo?: any) {
    const formattedMessage = this.formatMessage(
      'log',
      message,
      context,
      additionalInfo,
    );
    console.log(formattedMessage);
  }

  /**
   * Logs an error message with the level 'error' (color: red). Can include an error trace.
   * @param message - The main log message.
   * @param trace - The stack trace of the error.
   * @param context - The context of the log message.
   * @param additionalInfo - Additional information to be included in the log message.
   */
  error(
    message: string,
    trace?: string,
    context?: string,
    additionalInfo?: any,
  ) {
    const formattedMessage = this.formatMessage(
      'error',
      message,
      context,
      additionalInfo,
    );
    console.error(formattedMessage);
    if (trace) {
      console.error(`\n${trace}\n`);
    }
  }

  /**
   * Logs a warning message with the level 'warn' (color: yellow).
   * @param message - The main log message.
   * @param context - The context of the log message.
   * @param additionalInfo - Additional information to be included in the log message.
   */
  warn(message: string, context?: string, additionalInfo?: any) {
    const formattedMessage = this.formatMessage(
      'warn',
      message,
      context,
      additionalInfo,
    );
    console.warn(formattedMessage);
  }

  /**
   * Logs a debug message with the level 'debug' (color: green).
   * @param message - The main log message.
   * @param context - The context of the log message.
   * @param additionalInfo - Additional information to be included in the log message.
   */
  debug(message: string, context?: string, additionalInfo?: any) {
    const formattedMessage = this.formatMessage(
      'debug',
      message,
      context,
      additionalInfo,
    );
    console.debug(formattedMessage);
  }
}
