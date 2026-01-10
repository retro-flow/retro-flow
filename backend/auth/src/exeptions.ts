import { BadRequest, InternalError, StatusEnum, Unauthorized } from './schema'

export class UnauthorizedExeption extends Unauthorized {
  constructor(payload: { message: string }) {
    super({ status: StatusEnum.Error, code: 'UNAUTHORIZED', message: payload.message })
  }
}

export class BadRequestExeption extends BadRequest {
  constructor(payload: { message: string }) {
    super({ status: StatusEnum.Error, code: 'BAD_REQUEST', message: payload.message })
  }
}

export class InternalErrorExeption extends InternalError {
  constructor(payload: { message: string }) {
    super({ status: StatusEnum.Error, code: 'INTERNAL_ERROR', message: payload.message })
  }
}
