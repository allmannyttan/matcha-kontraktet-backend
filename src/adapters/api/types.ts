export interface APIRequest {
  url: string
  token?: string
}

export interface APIToken {
  id: number
  token_value: string
  created: Date
}
