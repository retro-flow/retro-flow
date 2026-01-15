import { customAlphabet } from 'nanoid'
import { Body, Controller, Get, Param, Post } from '@nestjs/common'

import { AuthService } from '@app/auth-service'
import { ForbiddenException, NotFoundException } from '@app/exceptions'
import { mapInviteType } from '@app/mapper'
import { PrismaService } from '@app/prisma-service'
import { InviteType } from '@app/prisma/enums'
import {
  Board,
  BoardSnapshot,
  Card,
  Column,
  CreateBoardRequest,
  DeleteBoardRequest,
  Invite,
  JoinBoardRequest,
  JoinBoardResponse,
  Like,
  OkResponse,
  UpdateBoardRequest,
} from '@app/schema'

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
            cards: {
              select: {
                id: true,
                text: true,
                position: true,
                userLogin: true,
                likes: {
                  select: {
                    // id: true,
                    userLogin: true,
                  },
                },
              },
            },
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
            cards: column.cards.map((card) => {
              return new Card({
                ...card,
                position: card.position.toNumber(),
                likes: card.likes.map((like) => {
                  return new Like(like)
                }),
              })
            }),
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

  @Post('/v1/boards/join')
  async joinBoard(@Body() body: JoinBoardRequest) {
    const user = await this.auth.getCurrentUser()
    const invite = await this.prisma.boardInvite.findUnique({
      where: { token: body.token },
      select: {
        boardId: true,
        type: true,
        expiresAt: true,
        board: { select: { ownerUserId: true } },
      },
    })

    if (!invite) {
      throw new ForbiddenException({ message: 'Invalid invite token' })
    }

    if (
      invite.type === InviteType.TEMPORARY &&
      (!invite.expiresAt || invite.expiresAt <= new Date())
    ) {
      throw new ForbiddenException({ message: 'Invite token expired' })
    }

    await this.prisma.boardMember.upsert({
      where: {
        boardId_userId: {
          userId: user.id,
          boardId: invite.boardId,
        },
      },
      create: {
        boardId: invite.boardId,
        userId: user.id,
      },
      update: {},
    })

    return new OkResponse(new JoinBoardResponse({ boardId: invite.boardId }))
  }

  private generateInviteToken() {
    const raw = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12)

    return raw()
  }
}
