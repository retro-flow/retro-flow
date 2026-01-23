import { map } from 'rxjs'
import * as v from 'valibot'
import {
  applyDecorators,
  Injectable,
  UseInterceptors,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common'

@Injectable()
class ValibotResponseInterceptor implements NestInterceptor {
  constructor(private schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>) {}

  intercept(_: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data: unknown) => ({
        status: 'ok',
        data: v.parse(this.schema, data),
      })),
    )
  }
}

export function ValibotResponse(schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>) {
  return applyDecorators(UseInterceptors(new ValibotResponseInterceptor(schema)))
}
