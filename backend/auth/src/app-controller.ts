import ms from 'ms'
import { v4 as uuidv4 } from 'uuid'
import { Body, Controller, Get, Post } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@auth/auth-service'
import { BcryptService } from '@auth/bcrypt-service'
import { PrismaService } from '@auth/prisma-service'
import { Prisma } from '@auth/prisma/client'
import { UserType } from '@auth/prisma/enums'
import {
  LoginGuestRequest,
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegistrationRequest,
  StatusEnum,
  UserTypeEnum,
} from '@auth/schema'
import { ContextService } from '@auth/vendor/async-context'

import { BadRequestExeption, UnauthorizedExeption } from './exeptions'

interface JwtUserPayload {
  id: string
  type: UserTypeEnum
}

interface JwtGuestPayload {
  id: string
  type: UserTypeEnum
  login: string
}

@Controller()
export class AppController {
  constructor(
    private bcrypt: BcryptService,
    private context: ContextService,
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @Get('/v1/me')
  async me() {
    const token = this.context.request.cookies[ACCESS_TOKEN_COOKIE]
    const data = this.jwt.decode<JwtUserPayload | JwtGuestPayload>(token)

    if (this.isGuestPayload(data)) {
      return new MeResponse({
        status: StatusEnum.Ok,
        data: {
          id: data.id,
          type: UserTypeEnum.Guest,
          profile: {
            login: data.login,
          },
        },
      })
    }

    const user = await this.prisma.user.findUnique({
      include: { profile: true },
      where: { id: data.id },
    })

    if (!user || !user.profile) {
      throw new UnauthorizedExeption({ message: 'Invalid credentials' })
    }

    return new MeResponse({
      status: StatusEnum.Ok,
      data: {
        id: user.id,
        type: UserTypeEnum.User,
        profile: {
          email: user.profile.email,
          login: user.profile.login,
        },
      },
    })
  }

  @Post('/v1/register')
  async register(@Body() payload: RegistrationRequest) {
    try {
      const result = await this.prisma.user.create({
        data: {
          type: UserType.USER,
          profile: {
            create: {
              email: payload.email,
              login: this.extractLoginFromEmail(payload.email),
            },
          },
          password: {
            create: {
              passwordHash: this.bcrypt.hash(payload.password),
            },
          },
        },
      })

      const accessToken = this.jwt.sign<JwtUserPayload>(
        { id: result.id, type: UserTypeEnum.User },
        { expiresIn: ms('30m') },
      )
      const refreshToken = this.jwt.sign({ id: result.id }, { expiresIn: ms('90d') })

      this.setAuthCookies(accessToken, refreshToken)

      return new LoginResponse({ status: StatusEnum.Ok })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestExeption({ message: 'A user with this email already exists' })
        }
      }

      throw error
    }
  }

  @Post('/v1/login')
  async login(@Body() payload: LoginRequest) {
    const profile = await this.prisma.profile.findUnique({
      include: {
        user: {
          select: { id: true, password: true },
        },
      },
      where: { email: payload.email },
    })

    if (!profile || !profile.user.password?.passwordHash) {
      throw new UnauthorizedExeption({ message: 'Invalid credentials' })
    }

    if (this.bcrypt.compare(payload.password, profile.user.password.passwordHash)) {
      throw new UnauthorizedExeption({ message: 'Invalid credentials' })
    }

    const accessToken = this.jwt.sign<JwtUserPayload>(
      { id: profile.user.id, type: UserTypeEnum.User },
      { expiresIn: ms('24Hours') },
    )
    const refreshToken = this.jwt.sign({ id: profile.user.id }, { expiresIn: ms('90Days') })

    this.setAuthCookies(accessToken, refreshToken)

    return new LoginResponse({ status: StatusEnum.Ok })
  }

  @Post('/v1/login/guest')
  loginGuest(@Body() payload: LoginGuestRequest) {
    const id = uuidv4()

    const accessToken = this.jwt.sign<JwtGuestPayload>(
      { id, login: payload.login, type: UserTypeEnum.Guest },
      { expiresIn: ms('24Hours') },
    )
    const refreshToken = this.jwt.sign({ id }, { expiresIn: ms('90Days') })

    this.setAuthCookies(accessToken, refreshToken)

    return new LoginResponse({ status: StatusEnum.Ok })
  }

  @Post('/v1/logout')
  logout() {
    this.unsetAuthCookies()

    return new LoginResponse({ status: StatusEnum.Ok })
  }

  private setAuthCookies(accessToken: string, refreshToken: string) {
    // TODO: Use expires from token.
    this.context.response.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      expires: new Date(new Date().getTime() + ms('1Year')),
    })
    this.context.response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      expires: new Date(new Date().getTime() + ms('1Year')),
    })
  }

  private unsetAuthCookies() {
    this.context.response.clearCookie(ACCESS_TOKEN_COOKIE)
    this.context.response.clearCookie(REFRESH_TOKEN_COOKIE)
  }

  private extractLoginFromEmail(email: string) {
    const [login] = email.split('@')

    return login as string
  }

  private isGuestPayload(data: unknown): data is JwtGuestPayload {
    return (
      typeof data === 'object' &&
      data !== null &&
      'type' in data &&
      data.type === UserTypeEnum.Guest
    )
  }
}
