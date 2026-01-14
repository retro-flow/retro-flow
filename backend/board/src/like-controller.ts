import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  NotFoundException,
  Post,
} from '@nestjs/common'

import { AuthService } from '@app/auth-service'
import { PrismaService } from '@app/prisma-service'
import { CreateCardLikeRequest, DeleteCardLikeRequest, OkResponse } from '@app/schema'

@Controller()
export class LikeController {
  constructor(
    private auth: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post('/v1/cards/like/create')
  async createLike(@Body() body: CreateCardLikeRequest) {
    const user = await this.auth.getCurrentUser()

    const card = await this.prisma.card.findUnique({
      where: { id: body.cardId },
      select: { id: true, boardId: true },
    })

    if (!card) {
      throw new NotFoundException({ message: 'Card not found' })
    }

    await this.#authorizeBoardAccess(card.boardId, user.id)

    await this.prisma.cardLike.createMany({
      data: [{ cardId: card.id, userId: user.id, userLogin: user.login }],
      skipDuplicates: true,
    })

    return new OkResponse({})
  }

  @Delete('/v1/cards/like/delete')
  async deleteLike(@Body() body: DeleteCardLikeRequest) {
    const user = await this.auth.getCurrentUser()

    return new OkResponse({})
  }

  async #authorizeBoardAccess(boardId: string, userId: string) {
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
}
