import { Controller, Delete, Patch, Post } from '@nestjs/common'

import { PrismaService } from '@app/prisma-service'

@Controller()
export class CardController {
  constructor(private prisma: PrismaService) {}

  @Post('/v1/cards/create')
  async createCard() {}

  @Patch('/v1/cards/update')
  async updateCard() {}

  @Delete('/v1/cards/delete')
  async deleteCard() {}
}
