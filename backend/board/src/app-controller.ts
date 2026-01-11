import { customAlphabet } from 'nanoid'
import { Body, Controller, Get, Param, Post } from '@nestjs/common'

import { AuthService } from '@app/auth-service'
import { PrismaService } from '@app/prisma-service'

import { NotFoundException } from './exceptions'
import { mapInviteType } from './mapper'
import {
  Board,
  BoardSnapshot,
  Column,
  CreateBoardRequest,
  DeleteBoardRequest,
  Invite,
  OkResponse,
  UpdateBoardRequest,
} from './schema'

@Controller()
export class AppController {
  constructor(
    private auth: AuthService,
    private prisma: PrismaService,
  ) {}

  @Get('/v1/boards')
  async getBoards() {
    const user = await this.auth.getCurrentUser()
    const boards = await this.prisma.board.findMany({
      where: { ownerUserId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return new OkResponse(boards.map((board) => new Board(board)))
  }

  @Get('/v1/boards/:boardId')
  async getBoard(@Param('boardId') boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: {
        id: boardId,
      },
      include: {
        invites: {
          select: {
            token: true,
            type: true,
            expiresAt: true,
          },
        },
        columns: {
          orderBy: {
            position: 'asc',
          },
          select: {
            id: true,
            title: true,
            position: true,
          },
        },
      },
    })

    // TODO: Throws forbidden when not member.
    if (!board) {
      throw new NotFoundException({ message: 'Board not found' })
    }

    return new OkResponse(
      new BoardSnapshot({
        ...board,
        invites: board.invites.map((invite) => {
          return new Invite({
            ...invite,
            type: mapInviteType(invite.type),
          })
        }),
        columns: board.columns.map((column) => {
          return new Column({
            ...column,
            position: column.position.toNumber(),
          })
        }),
      }),
    )
  }

  @Post('/v1/boards/create')
  async createBoard(@Body() body: CreateBoardRequest) {
    const user = await this.auth.getCurrentUser()
    const token = this.generateInviteToken()
    const board = await this.prisma.board.create({
      data: {
        title: body.title,
        ownerUserId: user.id,
        invites: {
          create: {
            token,
            expiresAt: null,
            type: 'PERMANENT',
          },
        },
      },
    })

    return new OkResponse(new Board(board))
  }

  @Post('/v1/boards/delete')
  async deleteBoard(@Body() body: DeleteBoardRequest) {
    const user = await this.auth.getCurrentUser()
    const board = await this.prisma.board.delete({
      select: {
        id: true,
      },
      where: {
        id: body.id,
        ownerUserId: user.id,
      },
    })

    return new OkResponse({ id: board.id })
  }

  @Post('/v1/boards/update')
  async updateBoard(@Body() body: UpdateBoardRequest) {
    const user = await this.auth.getCurrentUser()
    const board = await this.prisma.board.update({
      where: {
        id: body.id,
        ownerUserId: user.id,
      },
      data: {
        title: body.title,
      },
    })

    return new OkResponse(new Board(board))
  }

  private generateInviteToken() {
    const raw = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12)

    return raw()
  }
}
