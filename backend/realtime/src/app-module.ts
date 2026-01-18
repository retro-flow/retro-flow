import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'

import { AnyExceptionFilter } from '@app/any-exception-filter'
import { AuthService } from '@app/auth-service'
import { HttpExceptionFilter } from '@app/http-exception-filter'
import { TimeoutInterceptor } from '@app/timeout-interceptor'
import { AsyncContextModule } from '@app/vendor/async-context'

@Module({
  imports: [
    AsyncContextModule,
    JwtModule.register({
      secret: '0922c20292311238cb1cd7db7c815608',
    }),
  ],
  controllers: [],
  providers: [
    AuthService,
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_FILTER, useClass: AnyExceptionFilter },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
