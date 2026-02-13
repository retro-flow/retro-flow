import { AsyncLocalStorage } from 'async_hooks'

import type { Request, Response } from 'express'
import { invariant } from 'ts-invariant'
import { Injectable } from '@nestjs/common'

import type { ContextValue } from './async-context.types'

@Injectable()
export class ContextService {
  constructor(private storage: AsyncLocalStorage<ContextValue>) {}

  get request(): Request {
    return this.getStore().request
  }

  get response(): Response {
    return this.getStore().response
  }

  private getStore() {
    const store = this.storage.getStore()

    invariant(store, 'Async storage store is missing')

    return store
  }
}
