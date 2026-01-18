import chalk from 'chalk'
import { ConsoleLogger, Injectable, type LogLevel } from '@nestjs/common'

const DEFAULT_TEMPLATE = '{{date}} {{level}} {{context}} {{message}}'

const DEFAULT_COLORS_BY_LEVEL: Record<LogLevel, (text: string) => string> = {
  debug: chalk.magentaBright,
  warn: chalk.yellow,
  error: chalk.red,
  fatal: chalk.red,
  log: chalk.green,
  verbose: chalk.cyanBright,
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
})

@Injectable()
export class ConsoleLoggerService extends ConsoleLogger {
  override formatContext(context: string) {
    return context
  }

  override formatMessage(
    level: LogLevel,
    message: unknown,
    _$1: string,
    _$2: string,
    context: string,
  ): string {
    const colorize = DEFAULT_COLORS_BY_LEVEL[level]

    const now = dateTimeFormatter.format(Date.now())
    const out = this.#getMessageData(message)

    const result = DEFAULT_TEMPLATE.replace('{{date}}', chalk.grey(now))
      .replace('{{level}}', colorize(`[${level}]`))
      .replace('{{context}}', chalk.magenta(`(${context})`))
      .replace('{{message}}', colorize(out.message))

    return `${result}\n`
  }

  override printStackTrace(stack: string) {
    console.log(chalk.red(stack))
  }

  #getMessageData(data: unknown) {
    if (data instanceof Error) {
      return { message: data.message, stack: data.stack }
    }

    return { message: data as string }
  }
}
