import { ConfigurableModuleBuilder } from '@nestjs/common'

import type { KafkaModuleOptions } from './kafka.interface'

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<KafkaModuleOptions>({
    alwaysTransient: true,
    moduleName: 'Http',
  })
    .setClassMethodName('footRoot')
    .build()
