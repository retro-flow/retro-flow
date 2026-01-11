import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'

import { AppController } from '@app/app-controller'
import { AuthService } from '@app/auth-service'
import { HttpExceptionFilter } from '@app/http-exception-filter'
import { PrismaService } from '@app/prisma-service'
import { TimeoutInterceptor } from '@app/timeout-interceptor'
import { AsyncContextModule } from '@app/vendor/async-context'

@Module({
  imports: [
    AsyncContextModule,
    JwtModule.register({
      global: true,
      secret: '0922c20292311238cb1cd7db7c815608',
    }),
  ],
  controllers: [AppController],
  providers: [
    AuthService,
    PrismaService,
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
