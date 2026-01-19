import cookie from 'cookie'
import { Server, Socket } from 'socket.io'
import { Logger, UnauthorizedException, type OnModuleInit } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  type GatewayMetadata,
  type OnGatewayConnection,
} from '@nestjs/websockets'
import { KafkaService } from '@retro-flow/nest-kafka'

import { ACCESS_TOKEN_COOKIE } from '@app/auth-constants'

interface BoardEventData {
  type: string
  meta: {
    boardId: string
    columId: string
  }
  payload: Record<string, unknown>
}

interface SubscribeBoardPayload {
  boardId: string
}

@WebSocketGateway(81, {
  path: '/ws',
  transports: ['websocket'],
} satisfies GatewayMetadata)
export class WsGateway implements OnModuleInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server

  #logger = new Logger(WsGateway.name)

  constructor(
    private kafka: KafkaService,
    private jwt: JwtService,
  ) {}

  async onModuleInit() {
    await this.kafka.subscribe('board-events', (payload) => {
      if (this.#isBoardEventData(payload.json)) {
        this.server
          .to(`board:${payload.json.meta.boardId}`)
          .emit('board.updated', payload.json.payload)
      } else {
        this.#logger.error('Is not a board event data')
      }
    })
  }

  async handleConnection(socket: Socket) {
    try {
      const token = cookie.parse(socket.handshake.headers.cookie ?? '')[ACCESS_TOKEN_COOKIE]
      const user = this.jwt.decode(token ?? '')

      if (!user) {
        throw new UnauthorizedException()
      }
    } catch {
      socket.disconnect(true)
    }
  }

  @SubscribeMessage('board.join')
  async subscribeBoard(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: SubscribeBoardPayload,
  ) {
    if (!body.boardId) {
      return { status: 'error', message: 'boardId is required' }
    }

    const room = `board:${body.boardId}`

    await socket.join(room)

    return { status: 'ok' }
  }

  @SubscribeMessage('board.leave')
  async unsubscribeBoard(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: SubscribeBoardPayload,
  ) {
    if (body.boardId) {
      return { status: 'error', message: 'boardId is required' }
    }

    await socket.leave(`board:${body.boardId}`)

    return { status: 'ok' }
  }

  #isBoardEventData(_data: unknown): _data is BoardEventData {
    // TODO: Update this.
    return true
  }
}
