import { Body, Controller, Delete, Post } from '@nestjs/common'

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

    return new OkResponse({})
  }

  @Delete('/v1/cards/like/delete')
  async deleteLike(@Body() body: DeleteCardLikeRequest) {
    const user = await this.auth.getCurrentUser()

    return new OkResponse({})
  }
}
