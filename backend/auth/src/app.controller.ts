import { AppService } from '@auth/app.service'
import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello()
  }
}
