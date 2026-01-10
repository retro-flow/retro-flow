export enum StatusEnum {
  Ok = 'ok',
  Error = 'error',
}

export class ErrorResponse {
  status: StatusEnum
  message: string
  code: string

  constructor(data: ErrorResponse) {
    Object.assign(this, data)
  }
}

export class BadRequest extends ErrorResponse {}

export class Unauthorized extends ErrorResponse {}

export class InternalError extends ErrorResponse {}
