import { AsyncLocalStorage } from 'async_hooks'

import type { NextFunction, Request, Response } from 'express'
import { Injectable, type NestMiddleware } from '@nestjs/common'

import type { ContextValue } from './async-context.types'

@Injectable()
export class AsyncContextMiddleware implements NestMiddleware<Request, Response> {
  constructor(private storage: AsyncLocalStorage<ContextValue>) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const store = {
      request: req,
      response: res,
    } satisfies ContextValue

    this.storage.run(store, () => next())
  }
}
