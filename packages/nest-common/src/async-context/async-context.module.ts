import { AsyncLocalStorage } from 'async_hooks'

import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common'

import { AsyncContextMiddleware } from './async-context.middleware'
import { ContextService } from './async-context.service'

@Module({
  providers: [
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
    ContextService,
  ],
  exports: [ContextService],
})
export class AsyncContextModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AsyncContextMiddleware).forRoutes('*')
  }
}
