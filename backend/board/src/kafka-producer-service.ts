import { Kafka, type Producer } from 'kafkajs'
import { invariant } from 'ts-invariant'
import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  #producer: Producer

  async onModuleInit() {
    invariant(process.env.KAFKA_BROKERS, 'Missing kafka brokers')
    invariant(process.env.KAFKA_CLIENT_ID, 'Missing kafka client id')

    const brokers = process.env.KAFKA_BROKERS.split(',')
    const clientId = process.env.KAFKA_CLIENT_ID

    const kafka = new Kafka({ clientId, brokers })

    this.#producer = kafka.producer()

    await this.#producer.connect()
  }

  async onModuleDestroy() {
    await this.#producer?.disconnect()
  }

  async publish(topic: string, key: string, value: unknown) {
    await this.#producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(value) }],
    })
  }
}
