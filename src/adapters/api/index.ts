import axios from 'axios'
import config from '@app/config'
import { tokenRefresher } from './tokenHelper'
import { APIRequest } from './types'

const innerGet = async <T = any>(request: APIRequest) => {
  const headers = {
    Authorization: request.token || '',
    Accept: 'application/json',
  }
  const apiClient = axios.create({
    headers,
    baseURL: config.api.baseUrl,
    responseType: 'text',
  })

  const { data } = await apiClient.get(request.url)

  return data
}

export const client = {
  get: tokenRefresher(innerGet),
}

export default {
  client,
}
