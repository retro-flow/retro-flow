import { AppController } from '@auth/app.controller'
import { AppService } from '@auth/app.service'
import { Module } from '@nestjs/common'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
