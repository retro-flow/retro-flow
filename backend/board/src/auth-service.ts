import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { ACCESS_TOKEN_COOKIE } from '@app/auth-constants'
import { ContextService } from '@app/vendor/async-context'

enum UserType {
  User = 'user',
  Guest = 'guest',
}

interface JwtUserPayload {
  id: string
  type: UserType
  login: string
}

interface JwtGuestPayload {
  id: string
  type: UserType
  login: string
}

@Injectable()
export class AuthService {
  constructor(
    private context: ContextService,
    private jwt: JwtService,
  ) {}

  async getCurrentUser() {
    const token = this.context.request.cookies[ACCESS_TOKEN_COOKIE]
    const user = this.jwt.decode<JwtUserPayload | JwtGuestPayload>(token)

    return user
  }
}
