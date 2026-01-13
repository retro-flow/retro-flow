import type { Response } from 'express'
import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common'

import { ErrorResponse, StatusEnum } from '@app/schema'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  #logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()
    const status = exception.getStatus()

    const data = exception.getResponse()
    const result = this.#isErrorResponse(data) ? data : this.#getFallbackErrorResponse(status)

    this.#logger.error(exception, exception.stack)

    res.status(status).json(result)
  }

  #isErrorResponse(data: unknown): data is ErrorResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      'status' in data &&
      'code' in data &&
      'message' in data &&
      data.status === StatusEnum.Error
    )
  }

  #getFallbackErrorResponse(status: HttpStatus) {
    return {
      status: StatusEnum.Error,
      code: status === HttpStatus.REQUEST_TIMEOUT ? 'REQUEST_TIMEOUT' : 'INTERNAL_ERROR',
      message: '',
    } satisfies ErrorResponse
  }
}
