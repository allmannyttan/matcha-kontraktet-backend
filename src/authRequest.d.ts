declare namespace Express {
  export interface UserTokenInfo {
    sub: string
    username: string
    iat: number
    exp: number
  }
  export interface Request {
    auth?: UserTokenInfo
  }
}
