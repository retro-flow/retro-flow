import type { Request, Response } from 'express'

export interface ContextValue {
  request: Request
  response: Response
}
