/* eslint-disable no-console */
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
    additionalInfo?: any,
  ): string {
    const timestamp = this.getFormattedDate();
    const pid = process.pid;
    const levelStr = level.toString(); // Ensuring level is treated as a string
    let formattedLog = `[App ] ${pid}  - ${timestamp}     ${this.colors[levelStr]}${levelStr.toUpperCase()}${this.colors.reset} ${this.colors[levelStr]}${message}${this.colors.reset}`;

    if (additionalInfo) {
      formattedLog =
        levelStr === 'error'
          ? formattedLog.concat(
              `\n\n${additionalInfo.message}\n${additionalInfo.stack}`,
            )
          : formattedLog.concat(`\n\n${JSON.stringify(additionalInfo)}\n`);
    }

    return formattedLog;
  }

  private getFormattedDate() {
    const date = new Date();

    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'America/Sao_Paulo',
    }).format(date);
  }

  /**
   * Logs a message with the level 'log' (color: cyan).
   * @param message - The main log message.
   * @param additionalInfo - Additional information to be included in the log message.
   */
  log(message: string, additionalInfo?: any) {
    const formattedMessage = this.formatMessage('log', message, additionalInfo);
    console.log(formattedMessage);
  }

  /**
   * Logs an error message with the level 'error' (color: red). Can include an error trace.
   * @param message - The main log message.
   * @param trace - The stack trace of the error.
   * @param additionalInfo - Additional information to be included in the log message.
   */
  error(message: string, error?: any) {
    const formattedMessage = this.formatMessage('error', message, error);
    console.error(formattedMessage);
  }

  /**
   * Logs a warning message with the level 'warn' (color: yellow).
   * @param message - The main log message.
   * @param additionalInfo - Additional information to be included in the log message.
   */
  warn(message: string, context?: string, additionalInfo?: any) {
    const formattedMessage = this.formatMessage(
      'warn',
      message,
      additionalInfo,
    );
    console.warn(formattedMessage);
  }

  /**
   * Logs a debug message with the level 'debug' (color: green).
   * @param message - The main log message.
   * @param additionalInfo - Additional information to be included in the log message.
   */
  debug(message: string, context?: string, additionalInfo?: any) {
    const formattedMessage = this.formatMessage(
      'debug',
      message,
      additionalInfo,
    );
    console.debug(formattedMessage);
  }
}
