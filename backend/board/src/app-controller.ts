import { createHash } from 'node:crypto'

import { customAlphabet } from 'nanoid'
import { Body, Controller, Get, Post } from '@nestjs/common'

import { AuthService } from '@app/auth-service'
import { PrismaService } from '@app/prisma-service'

import { mapInviteType } from './mapper'
import {
  Board,
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
      include: {
        invites: {
          select: {
            token: true,
            type: true,
          },
        },
      },
    })

    return new OkResponse(
      boards.map(
        (board) =>
          new Board({
            ...board,
            invites: board.invites.map(
              (invite) =>
                new Invite({
                  type: mapInviteType(invite.type),
                  token: invite.token,
                  expiresAt: null,
                }),
            ),
          }),
      ),
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
      include: {
        invites: {
          select: {
            token: true,
            type: true,
          },
        },
      },
    })

    return new OkResponse(
      new Board({
        ...board,
        invites: board.invites.map(
          (invite) =>
            new Invite({
              type: mapInviteType(invite.type),
              token: invite.token,
              expiresAt: null,
            }),
        ),
      }),
    )
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
      include: {
        invites: {
          select: {
            token: true,
            type: true,
          },
        },
      },
    })

    return new OkResponse(
      new Board({
        ...board,
        invites: board.invites.map(
          (invite) =>
            new Invite({
              type: mapInviteType(invite.type),
              token: invite.token,
              expiresAt: null,
            }),
        ),
      }),
    )
  }

  private generateInviteToken() {
    const raw = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12)

    return raw()
  }
}
