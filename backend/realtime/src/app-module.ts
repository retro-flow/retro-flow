import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { KafkaModule } from '@retro-flow/nest-kafka'

import { AnyExceptionFilter } from '@app/any-exception-filter'
import { AuthService } from '@app/auth-service'
import { HttpExceptionFilter } from '@app/http-exception-filter'
import { TimeoutInterceptor } from '@app/timeout-interceptor'
import { AsyncContextModule } from '@app/vendor/async-context'
import { WsGateway } from '@app/ws-gateway'

@Module({
  imports: [
    // AsyncContextModule,
    JwtModule.register({
      secret: '0922c20292311238cb1cd7db7c815608',
    }),
    KafkaModule.footRoot({
      mode: 'sub',
      clientId: 'realtime-service',
      brokers: ['localhost:9092'],
      consumer: {
        groupId: 'realtime-service-group',
      },
    }),
  ],
  providers: [
    // AuthService,
    WsGateway,
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_FILTER, useClass: AnyExceptionFilter },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
