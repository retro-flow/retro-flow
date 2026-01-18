import type { ConsumerConfig, KafkaConfig, ProducerConfig } from 'kafkajs'

export type KafkaModuleOptions = ProducerModeOptions | ConsumerModeOptions | BothModeOptions

interface KafkaBaseConfig extends Omit<KafkaConfig, 'brokers' | 'clientId'> {
  clientId: string
  brokers: string[]
}

interface ProducerModeOptions extends KafkaBaseConfig {
  mode: 'pub'
  producer?: ProducerConfig
}

interface ConsumerModeOptions extends KafkaBaseConfig {
  mode: 'sub'
  consumer: ConsumerConfig
}

interface BothModeOptions extends KafkaBaseConfig {
  mode: 'pubsub'
  producer?: ProducerConfig
  consumer: ConsumerConfig
}
