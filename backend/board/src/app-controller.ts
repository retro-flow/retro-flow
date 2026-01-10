import { Controller } from '@nestjs/common'

import { PrismaService } from '@app/prisma-service'

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}
}
