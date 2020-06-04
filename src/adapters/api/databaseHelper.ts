import { db } from '@app/adapters/postgres'
import { APIToken } from './types'

export const getAccessTokenFromDb = async (): Promise<string | null> => {
  const [token] = await db
    .select('created', 'token_value')
    .from<APIToken>('api_tokens')
    .orderBy('created', 'desc')

  return token ? token.token_value : null
}

export const setAccessTokenInDb = async (
  token: string
): Promise<number | null> => {
  const [id] = await db('api_tokens')
    .returning('id')
    .insert({ token_value: token })

  return id
}
