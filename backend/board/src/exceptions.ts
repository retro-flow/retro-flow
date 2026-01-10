import { HttpException, HttpStatus } from '@nestjs/common'

import { ErrorResponse, StatusEnum } from '@app/schema'

export class UnauthorizedException extends HttpException {
  constructor(payload: { message: string }) {
    super(
      {
        status: StatusEnum.Error,
        code: 'UNAUTHORIZED',
        message: payload.message,
      } satisfies ErrorResponse,
      HttpStatus.UNAUTHORIZED,
    )
  }
}

export class BadRequestException extends HttpException {
  constructor(payload: { message: string }) {
    super(
      {
        status: StatusEnum.Error,
        code: 'BAD_REQUEST',
        message: payload.message,
      } satisfies ErrorResponse,
      HttpStatus.BAD_REQUEST,
    )
  }
}

export class InternalErrorException extends HttpException {
  constructor(payload: { message: string }) {
    super(
      {
        status: StatusEnum.Error,
        code: 'INTERNAL_ERROR',
        message: payload.message,
      } satisfies ErrorResponse,
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
  }
}
