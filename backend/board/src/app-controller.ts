import { Body, Controller, Get, Post } from '@nestjs/common'

import { AuthService } from '@app/auth-service'
import { PrismaService } from '@app/prisma-service'

import {
  Board,
  CreateBoardRequest,
  DeleteBoardRequest,
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
    })

    return new OkResponse(boards.map((board) => new Board(board)))
  }

  @Post('/v1/boards/create')
  async createBoard(@Body() body: CreateBoardRequest) {
    const user = await this.auth.getCurrentUser()
    const board = await this.prisma.board.create({
      data: {
        title: body.title,
        ownerUserId: user.id,
      },
    })

    return new OkResponse(new Board(board))
  }

  @Post('/v1/boards/delete')
  async deleteBoard(@Body() body: DeleteBoardRequest) {
    const user = await this.auth.getCurrentUser()
    const board = await this.prisma.board.delete({
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
}
