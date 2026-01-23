import * as v from 'valibot'
import { applyDecorators, BadRequestException, UsePipes, type PipeTransform } from '@nestjs/common'

class ValibotPipe implements PipeTransform {
  constructor(private schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>) {}

  transform(value: unknown) {
    try {
      return v.parse(this.schema, value)
    } catch (error) {
      // TODO: fix this
      throw new BadRequestException(error)
    }
  }
}

export function ValibotRequest(schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>) {
  return applyDecorators(UsePipes(new ValibotPipe(schema)))
}
