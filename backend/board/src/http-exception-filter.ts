import type { Response } from 'express'
import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  #logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    const http = host.switchToHttp()
    const response = http.getResponse<Response>()

    const status = exception.getStatus()
    const payload = exception.getResponse()

    const result = this.#getErrorResponse(payload)

    this.#logger.error(exception, exception.stack)

    response.status(status).json(result)
  }

  #getErrorResponse(data: string | object) {
    const response = { status: 'error', message: '', code: 'INTERNAL_ERROR' }

    if (typeof data === 'object' && data !== null) {
      if ('message' in data) {
        const message = Array.isArray(data.message) ? data.message : [data.message]
        response.message = message.join(', ')
      }
      if ('code' in data && typeof data.code === 'string') {
        response.code = data.code
      }
      if ('statusCode' in data && typeof data.statusCode === 'number') {
        const code = HttpStatus[data.statusCode]
        if (code !== undefined) {
          response.code = code
        }
      }
    }

    return response
  }
}
