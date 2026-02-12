import { customAlphabet } from 'nanoid'
import { ForbiddenException, Inject, Injectable } from '@nestjs/common'

import { AuthService } from '@app/auth-service'
import { NotFoundException } from '@app/exceptions'
import { PrismaService } from '@app/prisma-service'
import { InviteType } from '@app/prisma/enums'
import {
  BoardControllerImpl,
  type CreateBoardRequest,
  type DeleteBoardRequest,
  type GetBoardRequest,
  type JoinBoardRequest,
  type UpdateBoardRequest,
} from '@app/schema'

@Injectable()
export class BoardController extends BoardControllerImpl {
  @Inject(AuthService)
  auth: AuthService

  @Inject(PrismaService)
  prisma: PrismaService

  async getBoards() {
    const user = await this.auth.getCurrentUser()
    const boards = await this.prisma.board.findMany({
      where: { ownerUserId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return this.BoardsResponse({ status: 'ok', data: boards })
  }

  async getBoard(data: GetBoardRequest) {
    const board = await this.prisma.board.findUnique({
      where: {
        id: data.params.boardId,
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

    return this.BoardResponse({ status: 'ok', data: board })
  }

  async createBoard(data: CreateBoardRequest) {
    const user = await this.auth.getCurrentUser()
    const token = this.generateInviteToken()
    const board = await this.prisma.board.create({
      data: {
        title: data.body.title,
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

    return this.CreateBoardResponse({
      status: 'ok',
      data: board,
    })
  }

  async deleteBoard(data: DeleteBoardRequest) {
    const user = await this.auth.getCurrentUser()
    const board = await this.prisma.board.delete({
      select: {
        id: true,
      },
      where: {
        id: data.body.id,
        ownerUserId: user.id,
      },
    })

    return this.DeleteBoardResponse({ status: 'ok', data: board })
  }

  async updateBoard(data: UpdateBoardRequest) {
    const user = await this.auth.getCurrentUser()
    const board = await this.prisma.board.update({
      where: {
        id: data.body.id,
        ownerUserId: user.id,
      },
      data: {
        title: data.body.title,
      },
    })

    return this.UpdateBoardResponse({ status: 'ok', data: board })
  }

  async joinBoard(data: JoinBoardRequest) {
    const user = await this.auth.getCurrentUser()
    const invite = await this.prisma.boardInvite.findUnique({
      where: { token: data.body.token },
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

    return this.JoinBoardResponse({ status: 'ok', data: invite })
  }

  private generateInviteToken() {
    const raw = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12)

    return raw()
  }
}
