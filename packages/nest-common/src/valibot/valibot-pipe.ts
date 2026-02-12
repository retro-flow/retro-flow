import * as v from 'valibot'
import { BadRequestException, type PipeTransform } from '@nestjs/common'

export class ValibotPipe implements PipeTransform {
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
