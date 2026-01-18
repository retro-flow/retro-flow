import { Module } from '@nestjs/common'

import { ConfigurableModuleClass } from './kafka.definition'
import { KafkaService } from './kafka.service'

@Module({
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule extends ConfigurableModuleClass {}
