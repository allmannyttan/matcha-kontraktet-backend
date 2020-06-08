import axios, { AxiosResponse } from 'axios'
import config from '@app/config'
import { getAccessTokenFromDb, setAccessTokenInDb } from './databaseHelper'
import { APIRequest } from './types'

const NO_TOKENS_IN_DB_ERROR = 'Access token missing in DB.'

export const getNewAccessToken = async (): Promise<string> => {
  const loginResult: AxiosResponse<any> = await axios.post(
    'auth/generate-token',
    {
      username: config.api.username,
      password: config.api.password,
    },
    {
      baseURL: config.api.baseUrl,
      responseType: 'json',
    }
  )

  const token: string = loginResult.data.token
  return token
}

const isInvalidAccessTokenError = (error: Error): boolean => {
  return (
    error.message === 'Request failed with status code 403' ||
    error.message === 'Request failed with status code 401' ||
    error.message === NO_TOKENS_IN_DB_ERROR
  )
}

/**
 * Gets the latest fastAPI token from DB and passes that to the function it wraps.
 * If the call to the wrapped function fails in a way that indicates
 * that it is due to an invalid token it gets a new token from fastAPI, stores it in DB
 * and calls the wrapped funtion with the new token.
 *
 * @param {wrapped function} func
 */
export const tokenRefresher = <T extends (arg: APIRequest) => any>(
  func: T
): ((funcArg: APIRequest) => Promise<ReturnType<T>>) => {
  return async (arg: APIRequest): Promise<ReturnType<T>> => {
    try {
      const token = await getAccessTokenFromDb()

      if (token === null) {
        throw new Error(NO_TOKENS_IN_DB_ERROR)
      }

      arg.token = token
      const results = await func(arg)
      return results
    } catch (error) {
      //If error is invalid access-token, get a new one and retry.
      if (isInvalidAccessTokenError(error)) {
        const token = await getNewAccessToken()

        await setAccessTokenInDb(token)

        arg.token = token
        const results = await func(arg)
        return results
      } else {
        throw error
      }
    }
  }
}

export default {
  tokenRefresher,
}
