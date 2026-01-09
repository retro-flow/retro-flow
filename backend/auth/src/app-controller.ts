import { Body, Controller, Get, Post } from '@nestjs/common'

import { RegistrationRequest, RegistrationResponse } from './schema'

@Controller()
export class AppController {
  constructor() {}

  @Post('/register')
  register(@Body() payload: RegistrationRequest) {
    console.log('>>> payload', payload)

    return new RegistrationResponse({
      accessToken: '',
      refreshToken: '',
    })
  }

  @Post('/login')
  login() {
    return {}
  }

  @Post('/login/guest')
  loginGuest() {
    return {}
  }

  @Get('/me')
  me() {
    return {}
  }
}
