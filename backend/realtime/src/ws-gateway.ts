import { Server, Socket } from 'socket.io'
import { Logger, type OnModuleInit } from '@nestjs/common'
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

  constructor(private kafka: KafkaService) {}

  async onModuleInit() {
    await this.kafka.subscribe('board-events', (payload) => {
      if (this.#isBoardEventData(payload.json)) {
        this.server
          .to(`board:${payload.json.meta.boardId}`)
          .emit('board_event', payload.json.payload)
      } else {
        this.#logger.error('Is not a board event data')
      }
    })
  }

  async handleConnection(_socket: Socket) {}

  @SubscribeMessage('events')
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

  @SubscribeMessage('unsubscribe_board')
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
