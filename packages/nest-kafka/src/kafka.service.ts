import { Kafka, type Consumer, type EachMessagePayload, type Producer } from 'kafkajs'
import { invariant } from 'ts-invariant'
import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'

import { MODULE_OPTIONS_TOKEN } from './kafka.definition'
import type { KafkaModuleOptions } from './kafka.interface'

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  #producer?: Producer
  #consumer?: Consumer

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private options: KafkaModuleOptions,
  ) {}

  async onModuleInit() {
    invariant(this.options.brokers.length > 0, 'Kafka brokers are empty')
    invariant(this.options.clientId, 'Kafka clientId is missing')

    const kafka = new Kafka(this.options)

    if (this.options.mode === 'pub' || this.options.mode === 'pubsub') {
      this.#producer = kafka.producer(this.options.producer)
      await this.#producer.connect()
    }

    if (this.options.mode === 'sub' || this.options.mode === 'pubsub') {
      this.#consumer = kafka.consumer(this.options.consumer)
      await this.#consumer.connect()
    }
  }

  async onModuleDestroy() {
    try {
      await this.#consumer?.disconnect()
      await this.#producer?.disconnect()
    } catch {}
  }

  async publish(topic: string, key: string, value: unknown) {
    invariant(this.#producer, 'Kafka producer is not enabled')

    await this.#producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(value) }],
    })
  }

  async subscribe<T = unknown>(
    topic: string,
    handler: (payload: EachMessagePayload & { json: T | undefined }) => Promise<void> | void,
    options?: { fromBeginning?: boolean },
  ) {
    invariant(this.#consumer, 'Kafka consumer is not enabled')

    await this.#consumer.subscribe({ topic, fromBeginning: options?.fromBeginning ?? false })
    await this.#consumer.run({
      eachMessage: async (payload) => {
        await handler({
          ...payload,
          json: (() => {
            try {
              return payload.message.value
                ? JSON.parse(payload.message.value.toString())
                : undefined
            } catch {}
          })(),
        })
      },
    })
  }
}
