import { AsyncLocalStorage } from 'async_hooks'

import { invariant } from 'ts-invariant'
import { Injectable } from '@nestjs/common'

import type { ContextValue } from './async-context.types'

@Injectable()
export class ContextService {
  constructor(private storage: AsyncLocalStorage<ContextValue>) {}

  get request() {
    return this.getStore().request
  }

  get response() {
    return this.getStore().response
  }

  private getStore() {
    const store = this.storage.getStore()

    invariant(store, 'Async storage store is missing')

    return store
  }
}
