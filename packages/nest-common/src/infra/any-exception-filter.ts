import type { Response } from 'express'
import { Catch, HttpStatus, Logger, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common'

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  #logger = new Logger(AnyExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp()
    const response = http.getResponse<Response>()

    const result = this.#getErrorResponse()

    if (exception instanceof Error) {
      this.#logger.error(exception, exception.stack)
    } else {
      this.#logger.error(exception)
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result)
  }

  #getErrorResponse() {
    const response = { status: 'error', message: '', code: 'INTERNAL_ERROR' }

    return response
  }
}
