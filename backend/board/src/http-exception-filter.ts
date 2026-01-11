import type { Response } from 'express'
import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common'

import { ErrorResponse, StatusEnum } from '@app/schema'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()
    const status = exception.getStatus()

    console.log('>>> exception', exception)

    const data = exception.getResponse()
    const result = this.isErrorResponse(data) ? data : this.getFallbackErrorResponse(status)

    res.status(status).json(result)
  }

  private isErrorResponse(data: unknown): data is ErrorResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      'status' in data &&
      'code' in data &&
      'message' in data &&
      data.status === StatusEnum.Error
    )
  }

  private getFallbackErrorResponse(status: HttpStatus) {
    return {
      status: StatusEnum.Error,
      code: status === HttpStatus.REQUEST_TIMEOUT ? 'REQUEST_TIMEOUT' : 'INTERNAL_ERROR',
      message: '',
    } satisfies ErrorResponse
  }
}
