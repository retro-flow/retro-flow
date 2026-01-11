import { Injectable, type CanActivate } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { ACCESS_TOKEN_COOKIE } from '@app/auth-constants'
import { ContextService } from '@app/vendor/async-context'

import { UnauthorizedException } from './exceptions'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private context: ContextService,
    private jwt: JwtService,
  ) {}

  async canActivate() {
    try {
      const token = this.context.request.cookies[ACCESS_TOKEN_COOKIE]
      const isValid = this.jwt.verify(token)

      return isValid
    } catch {
      throw new UnauthorizedException({ message: 'Invalid credentials' })
    }
  }
}
