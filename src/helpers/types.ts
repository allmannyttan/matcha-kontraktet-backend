export interface User {
  id: number
  username: string
  locked: boolean
  disabled: boolean
  passwordHash: string
  salt: string
  failedLoginAttempts: number
}

export interface UserTokenInfo {
  sub: string
  username: string
  iat?: number
  exp?: number
}

export interface PasswordAndHash {
  password: string
  salt: string
}

export interface JWT {
  token: string
}
