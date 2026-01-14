import { Body, Controller, Delete, Patch, Post } from '@nestjs/common'

import { AuthService } from '@app/auth-service'
import { ForbiddenException, NotFoundException } from '@app/exceptions'
import { PrismaService } from '@app/prisma-service'
import { Prisma } from '@app/prisma/client'
import { CreateCardRequest, DeleteCardRequest, OkResponse, UpdateCardRequest } from '@app/schema'

@Controller()
export class CardController {
  constructor(
    private auth: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post('/v1/cards/create')
  async createCard(@Body() body: CreateCardRequest) {
    const user = await this.auth.getCurrentUser()

    await this.authorizeBoardAccess(body.boardId, user.id)

    await this.prisma.$transaction(async (tx) => {
      const column = await tx.column.findFirst({
        where: { id: body.columnId, boardId: body.boardId },
        select: { id: true },
      })

      if (!column) {
        throw new NotFoundException({ message: 'Column not found' })
      }

      const position = await this.nextCardPositionAtEnd(tx, body.boardId, body.columnId)

      return tx.card.create({
        data: {
          boardId: body.boardId,
          columnId: body.columnId,
          text: body.text,
          position,
          userId: user.id,
          userLogin: user.login,
        },
      })
    })

    return new OkResponse({})
  }

  @Patch('/v1/cards/update')
  async updateCard(@Body() body: UpdateCardRequest) {
    const user = await this.auth.getCurrentUser()

    const card = await this.prisma.card.findUnique({
      where: { id: body.id },
      select: { id: true, boardId: true, userId: true },
    })

    if (!card) {
      throw new NotFoundException({ message: 'Card not found' })
    }

    const access = await this.authorizeBoardAccess(card.boardId, user.id)

    if (!access.owner) {
      const isAuthor = card.userId === user.id

      if (!isAuthor) {
        throw new ForbiddenException({ message: 'Can edit only own cards' })
      }
    }

    await this.prisma.card.update({
      where: { id: body.id },
      data: {
        text: body.text,
      },
    })

    return new OkResponse({})
  }

  @Delete('/v1/cards/delete')
  async deleteCard(@Body() body: DeleteCardRequest) {
    const user = await this.auth.getCurrentUser()

    const card = await this.prisma.card.findUnique({
      where: { id: body.id },
      select: { id: true, boardId: true, userId: true },
    })

    if (!card) {
      throw new NotFoundException({ message: 'Card not found' })
    }

    const access = await this.authorizeBoardAccess(card.boardId, user.id)

    if (!access.owner) {
      const isAuthor = card.userId === user.id

      if (!isAuthor) {
        throw new ForbiddenException({ message: 'Can delete only own cards' })
      }
    }

    await this.prisma.card.delete({ where: { id: body.id } })

    return new OkResponse({ id: card.id })
  }

  private async authorizeBoardAccess(boardId: string, userId: string) {
    const isOwner = await this.prisma.board.findFirst({
      where: { id: boardId, ownerUserId: userId },
      select: { id: true },
    })

    if (isOwner) {
      return { owner: true, member: true }
    }

    const isMember = await this.prisma.boardMember.findFirst({
      where: { boardId, userId: userId },
      select: { id: true },
    })

    if (!isMember) {
      throw new ForbiddenException({ message: 'Not a board member' })
    }

    return { owner: false, member: true }
  }

  private async nextCardPositionAtEnd(
    tx: Prisma.TransactionClient,
    boardId: string,
    columnId: string,
  ) {
    const last = await tx.card.findFirst({
      where: { boardId, columnId },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    if (!last) {
      return new Prisma.Decimal('1000')
    }

    return new Prisma.Decimal(last.position).plus(new Prisma.Decimal('1000'))
  }
}
