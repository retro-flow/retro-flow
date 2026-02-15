import { Controller, Inject } from '@nestjs/common'

import { AuthService } from '@app/auth-service'
import { ForbiddenException } from '@app/exceptions'
import { PrismaService } from '@app/prisma-service'
import { Prisma } from '@app/prisma/client'
import {
  ColumnControllerImpl,
  type CreateColumnRequest,
  type DeleteColumnRequest,
} from '@app/schema'

@Controller()
export class ColumnController extends ColumnControllerImpl {
  @Inject(AuthService)
  auth: AuthService

  @Inject(PrismaService)
  prisma: PrismaService

  async createColumn(data: CreateColumnRequest) {
    const user = await this.auth.getCurrentUser()

    await this.assertBoardOwner(data.body.boardId, user.id)

    await this.prisma.$transaction(async (tx) => {
      const position = await this.getNextEndPosition(tx, data.body.boardId)

      return tx.column.create({
        data: { boardId: data.body.boardId, title: data.body.title, position },
      })
    })

    return this.SuccessResponse({ status: 'ok' })
  }

  async deleteColumn(data: DeleteColumnRequest) {
    const user = await this.auth.getCurrentUser()

    await this.assertBoardOwner(data.body.boardId, user.id)

    await this.prisma.column.delete({
      where: { id: data.body.id, boardId: data.body.boardId },
    })

    return this.SuccessResponse({ status: 'ok' })
  }

  private async assertBoardOwner(boardId: string, userId: string) {
    const board = await this.prisma.board.findFirst({
      where: { id: boardId, ownerUserId: userId },
      select: { id: true },
    })

    if (!board) {
      throw new ForbiddenException({ message: 'Not an owner or board not found' })
    }
  }

  private async getNextEndPosition(
    tx: Prisma.TransactionClient,
    boardId: string,
  ): Promise<Prisma.Decimal> {
    const last = await tx.column.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    if (!last) {
      return new Prisma.Decimal('1000')
    }

    return new Prisma.Decimal(last.position).plus(new Prisma.Decimal('1000'))
  }
}
