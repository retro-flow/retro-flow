import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator'

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

export class Forbidden extends ErrorResponse {}

export class NotFound extends ErrorResponse {}

export class BadRequest extends ErrorResponse {}

export class Unauthorized extends ErrorResponse {}

export class InternalError extends ErrorResponse {}

export enum UserTypeEnum {
  User = 'user',
  Guest = 'guest',
}

export enum InviteType {
  Temporary = 'temporary',
  Permanent = 'permanent',
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

export class BoardSnapshot {
  id: string
  title: string
  seq: number
  ownerUserId: string
  createdAt: string
  invites: Invite[]
  columns: Column[]

  constructor(payload: {
    id: string
    title: string
    seq: number
    ownerUserId: string
    createdAt: Date
    invites: Invite[]
    columns: Column[]
  }) {
    this.id = payload.id
    this.title = payload.title
    this.seq = payload.seq
    this.invites = payload.invites
    this.columns = payload.columns
  }
}

export class Column {
  id: string
  position: number
  title: string
  cards: Card[]

  constructor(payload: Column) {
    this.id = payload.id
    this.position = payload.position
    this.title = payload.title
    this.cards = payload.cards
  }
}

export class Invite {
  type: InviteType
  expiresAt: string | null
  token: string

  constructor(payload: { expiresAt: Date | null; token: string; type: InviteType }) {
    this.type = payload.type
    this.expiresAt = payload.expiresAt?.toISOString() ?? null
    this.token = payload.token
  }
}

export class CreateColumnRequest {
  @IsString()
  @IsNotEmpty()
  boardId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string
}

export class DeleteColumnRequest {
  @IsString()
  @IsNotEmpty()
  boardId: string

  @IsString()
  @IsNotEmpty()
  id: string
}

export class JoinBoardRequest {
  @IsString()
  @IsNotEmpty()
  token: string
}

export class JoinBoardResponse {
  boardId: string

  constructor(payload: JoinBoardResponse) {
    this.boardId = payload.boardId
  }
}

export class CreateCardRequest {
  @IsUUID()
  columnId: string

  @IsUUID()
  boardId: string

  @IsString()
  @IsNotEmpty()
  text: string
}

export class UpdateCardRequest {
  @IsUUID()
  id: string

  @IsString()
  @IsNotEmpty()
  text: string
}

export class DeleteCardRequest {
  @IsUUID()
  id: string
}

export class Card {
  id: string
  text: string
  userLogin: string
  position: number

  constructor(payload: Card) {
    this.id = payload.id
    this.text = payload.text
    this.userLogin = payload.userLogin
    this.position = payload.position
  }
}
