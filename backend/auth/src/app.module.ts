import { Module } from '@nestjs/common'

import { AppController } from '@auth/app.controller.js'
import { AppService } from '@auth/app.service.js'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
