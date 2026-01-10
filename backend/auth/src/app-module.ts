import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'

import { AppController } from '@auth/app-controller'
import { BcryptService } from '@auth/bcrypt-service'
import { PrismaService } from '@auth/prisma-service'
import { AsyncContextModule } from '@auth/vendor/async-context'

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
    BcryptService,
    PrismaService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
