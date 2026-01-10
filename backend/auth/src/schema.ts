import { IsEmail, IsString } from 'class-validator'

export enum StatusEnum {
  Ok = 'ok',
  Error = 'error',
}

export enum UserTypeEnum {
  User = 'user',
  Guest = 'guest',
}

export class MeResponse {
  status: StatusEnum
  data: {
    id: string
    type: UserTypeEnum
    profile: {
      email?: string
      login: string
    }
  }

  constructor(data: MeResponse) {
    Object.assign(this, data)
  }
}

export class RegistrationRequest {
  @IsEmail()
  email: string

  @IsString()
  password: string
}

export class LoginRequest {
  @IsEmail()
  email: string

  @IsString()
  password: string
}

export class LoginGuestRequest {
  @IsString()
  login: string
}

export class LoginResponse {
  status: StatusEnum

  constructor(data: LoginResponse) {
    Object.assign(this, data)
  }
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
