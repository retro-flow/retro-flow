import { Body, Controller, Delete, Patch, Post } from '@nestjs/common'

import { AuthService } from '@app/auth-service'
import { ForbiddenException, NotFoundException } from '@app/exceptions'
import { PrismaService } from '@app/prisma-service'
import { Prisma } from '@app/prisma/client'
import { CreateCardRequest, OkResponse } from '@app/schema'

@Controller()
export class CardController {
  constructor(
    private auth: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post('/v1/cards/create')
  async createCard(@Body() body: CreateCardRequest) {
    const user = await this.auth.getCurrentUser()

    await this.assertBoardAccess(body.boardId, user.id)

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
  async updateCard() {}

  @Delete('/v1/cards/delete')
  async deleteCard() {}

  private async assertBoardAccess(boardId: string, userId: string) {
    const isOwner = await this.prisma.board.findFirst({
      where: { id: boardId, ownerUserId: userId },
      select: { id: true },
    })

    if (isOwner) {
      return true
    }

    const isMember = await this.prisma.boardMember.findFirst({
      where: { boardId, userId: userId },
      select: { id: true },
    })

    if (!isMember) {
      throw new ForbiddenException({ message: 'Not a board member' })
    }

    return true
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
