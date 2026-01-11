import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

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

export enum UserTypeEnum {
  User = 'user',
  Guest = 'guest',
}

export enum InviteTypeEnum {
  Temporary = 'TEMPORARY',
  Permanent = 'PERMANENT',
}

export class OkResponse<T> {
  status: StatusEnum
  data: T

  constructor(data: T) {
    this.status = StatusEnum.Ok
    this.data = data
  }
}

export class CreateBoardRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string
}

export class UpdateBoardRequest {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string
}

export class DeleteBoardRequest {
  @IsString()
  @IsNotEmpty()
  id: string
}

export class Board {
  id: string
  title: string
  seq: number
  ownerUserId: string
  createdAt: string

  constructor(payload: {
    id: string
    title: string
    seq: number
    ownerUserId: string
    createdAt: Date
  }) {
    this.id = payload.id
    this.title = payload.title
    this.seq = payload.seq
    this.ownerUserId = payload.ownerUserId
    this.createdAt = payload.createdAt.toISOString()
  }
}
