import { IsEmail, IsString } from 'class-validator'

export class RegistrationRequest {
  @IsEmail()
  email: string

  @IsString()
  password: string
}

export class RegistrationResponse {
  accessToken: string

  refreshToken: string

  constructor(data: RegistrationResponse) {
    Object.assign(this, data)
  }
}
