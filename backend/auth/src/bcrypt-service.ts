import bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common'

@Injectable()
export class BcryptService {
  private saltRounds = 12

  hash(data: string) {
    return bcrypt.hashSync(data, this.saltRounds)
  }

  compare(data: string, encrypted: string) {
    return bcrypt.compareSync(data, encrypted)
  }
}
