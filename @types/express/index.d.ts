declare namespace Express {
  interface UserTokenInfo {
    sub: string
    username: string
    iat: number
    exp: number
  }
  interface Request {
    auth?: UserTokenInfo
  }
}
