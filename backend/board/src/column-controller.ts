import { Body, Controller, Post } from '@nestjs/common'

import { AuthService } from '@app/auth-service'
import { PrismaService } from '@app/prisma-service'
import { Prisma } from '@app/prisma/client'
import { DeleteColumnRequest, OkResponse, type CreateColumnRequest } from '@app/schema'

import { ForbiddenException } from './exceptions'

@Controller()
export class ColumnController {
  constructor(
    private auth: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post('/v1/boards/columns/create')
  async createColumn(@Body() body: CreateColumnRequest) {
    const user = await this.auth.getCurrentUser()

    await this.assertBoardOwner(body.boardId, user.id)

    await this.prisma.$transaction(async (tx) => {
      const position = await this.getNextEndPosition(tx, body.boardId)

      return tx.column.create({
        data: { boardId: body.boardId, title: body.title, position },
      })
    })

    return new OkResponse({})
  }

  @Post('/v1/boards/columns/delete')
  async deleteColumn(@Body() body: DeleteColumnRequest) {
    const user = await this.auth.getCurrentUser()

    await this.assertBoardOwner(body.boardId, user.id)

    await this.prisma.column.delete({
      where: { id: body.id, boardId: body.boardId },
    })

    return new OkResponse({})
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
