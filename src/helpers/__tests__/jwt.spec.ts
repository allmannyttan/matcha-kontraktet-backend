import { authorize, createToken, refreshToken } from '../jwt'
import hash from '../hash'
import jwt from 'jsonwebtoken'
import {
  setUserFailedLoginAttempts,
  setUserLocked,
  getUser,
} from '@app/middleware/auth/databaseHelper'
import { User, UserTokenInfo } from '../types'
import createHttpError from 'http-errors'
import config from '../../config'

jest.mock('@app/config', () => ({
  postgres: {
    host: 'host',
    user: 'user',
    password: 'pwd',
    database: 'db',
    port: 5442,
  },
  auth: {
    maxFailedLoginAttempts: 7,
    secret: 'a secret',
    expiresIn: 'en vecka',
  },
}))
jest.mock('../hash')
jest.mock('jsonwebtoken')
jest.mock('@app/middleware/auth/databaseHelper')

let validUser: User

beforeEach(() => {
  console.error = jest.fn()
  validUser = {
    id: 1,
    disabled: false,
    failedLoginAttempts: 0,
    locked: false,
    passwordHash: 'valid hash',
    salt: 'a salt',
    username: 'validuser',
  }
  ;(hash.hashPassword as jest.Mock).mockResolvedValue('valid hash')
  ;(jwt.sign as jest.Mock).mockReturnValue('the token')
  ;(getUser as jest.Mock).mockResolvedValue(validUser)
})

describe('#jwt', () => {
  describe('#createToken', () => {
    afterEach(() => {
      jest.resetAllMocks()
    })

    test('it gets the user from the database', async () => {
      await createToken('username', 'password')

      expect(getUser).toHaveBeenCalledWith('username')
    })

    test('it creates a token at successful login', async () => {
      const result = await createToken('username', 'password')

      expect(result.token).toEqual('the token')
    })

    test('it creates tokens with proper parameters', async () => {
      await createToken('username', 'password')

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          sub: validUser.id,
          username: validUser.username,
        },
        'a secret',
        {
          expiresIn: 'en vecka',
        }
      )
    })

    test('it logs and throws Authentication error if password is incorrect', async () => {
      ;(hash.hashPassword as jest.Mock).mockResolvedValue('NOT a valid hash')

      try {
        await createToken('username', 'password')
      } catch (e) {
        expect(console.error).toHaveBeenCalledWith(
          new Error(`Invalid password: ${validUser.id}.`)
        )
        expect(e).toBeInstanceOf(createHttpError.HttpError)
        expect(e.status).toEqual(401)
      }
    })

    test('it logs and throws error if user is missing', async () => {
      ;(getUser as jest.Mock).mockResolvedValue(null)

      try {
        await createToken('username', 'password')
      } catch (e) {
        expect(console.error).toHaveBeenCalledWith(
          new Error(`No such user: username.`)
        )
        expect(e).toBeInstanceOf(createHttpError.HttpError)
        expect(e.status).toEqual(401)
      }
    })

    test('it logs and throws error if user is locked', async () => {
      validUser.locked = true

      try {
        await createToken('username', 'password')
      } catch (e) {
        expect(console.error).toHaveBeenCalledWith(
          new Error(`User locked: ${validUser.id}.`)
        )
        expect(e).toBeInstanceOf(createHttpError.HttpError)
        expect(e.status).toEqual(401)
      }
    })

    test('it logs and throws error if user is disabled', async () => {
      validUser.disabled = true

      try {
        await createToken('username', 'password')
      } catch (e) {
        expect(console.error).toHaveBeenCalledWith(
          new Error(`User disabled: ${validUser.id}.`)
        )
        expect(e).toBeInstanceOf(createHttpError.HttpError)
        expect(e.status).toEqual(401)
      }
    })

    test('it increases number of failed logins if password is wrong', async () => {
      ;(hash.hashPassword as jest.Mock).mockResolvedValue('NOT a valid hash')

      try {
        await createToken('username', 'password')
      } catch (e) {
        expect(setUserFailedLoginAttempts).toHaveBeenCalledWith(validUser.id, 1)
      }
    })

    test('it locks a user when max number of failed logins is reached', async () => {
      ;(hash.hashPassword as jest.Mock).mockResolvedValue('NOT a valid hash')
      validUser.failedLoginAttempts = 6

      try {
        await createToken('username', 'password')
      } catch (e) {
        expect(setUserLocked).toHaveBeenCalledWith(1, true)
      }
    })

    test('it resets failed logins when correct login is made', async () => {
      validUser.failedLoginAttempts = 6

      await createToken('username', 'password')

      expect(setUserFailedLoginAttempts).toHaveBeenCalledWith(validUser.id, 0)
    })
  })

  describe('#refreshToken', () => {
    afterEach(() => {
      jest.resetAllMocks()
    })

    test('it gets the user from the database', async () => {
      await refreshToken({
        username: 'username',
        sub: '1337',
        exp: 1111,
        iat: 2222,
      })

      expect(getUser).toHaveBeenCalledWith('username')
    })

    test('it creates a token at successful login', async () => {
      const result = await refreshToken({
        username: 'username',
        sub: '1337',
        exp: 1111,
        iat: 2222,
      })

      expect(result.token).toEqual('the token')
    })

    test('it creates tokens with proper parameters', async () => {
      await refreshToken({
        username: 'username',
        sub: '1337',
        exp: 1111,
        iat: 2222,
      })

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          sub: validUser.id,
          username: validUser.username,
        },
        'a secret',
        {
          expiresIn: 'en vecka',
        }
      )
    })

    test('it logs and throws error if user is missing', async () => {
      ;(getUser as jest.Mock).mockResolvedValue(null)

      try {
        await refreshToken({
          username: 'username',
          sub: '1337',
          exp: 1111,
          iat: 2222,
        })
      } catch (e) {
        expect(console.error).toHaveBeenCalledWith(
          new Error(`No such user: username.`)
        )
        expect(e).toBeInstanceOf(createHttpError.HttpError)
        expect(e.status).toEqual(401)
      }
    })

    test('it logs and throws error if user is locked', async () => {
      validUser.locked = true

      try {
        await refreshToken({
          username: 'username',
          sub: '1337',
          exp: 1111,
          iat: 2222,
        })
      } catch (e) {
        expect(console.error).toHaveBeenCalledWith(
          new Error(`User locked: ${validUser.id}.`)
        )
        expect(e).toBeInstanceOf(createHttpError.HttpError)
        expect(e.status).toEqual(401)
      }
    })

    test('it logs and throws error if user is disabled', async () => {
      validUser.disabled = true

      try {
        await refreshToken({
          username: 'username',
          sub: '1337',
          exp: 1111,
          iat: 2222,
        })
      } catch (e) {
        expect(console.error).toHaveBeenCalledWith(
          new Error(`User disabled: ${validUser.id}.`)
        )
        expect(e).toBeInstanceOf(createHttpError.HttpError)
        expect(e.status).toEqual(401)
      }
    })
  })

  describe('#authorize', () => {
    const refreshedToken: UserTokenInfo = {
      sub: 'a sub',
      username: 'a username',
    }
    const headers = { authorization: 'a token' }

    beforeEach(() => {
      ;(jwt.verify as jest.Mock).mockReturnValue(refreshedToken)
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    test('it uses authorization header to verify token', () => {
      authorize(headers)

      expect(jwt.verify).toHaveBeenCalledWith('a token', config.auth.secret)
    })

    test('it removes "Bearer" from authorization header', () => {
      headers.authorization = 'Bearer a token'
      authorize(headers)

      expect(jwt.verify).toHaveBeenCalledWith('a token', config.auth.secret)
    })

    test('it returns an object with property "auth" holding the new jwt', () => {
      const result = authorize(headers)

      expect(result).toHaveProperty('auth')
      expect(result.auth).toEqual(refreshedToken)
    })

    test('it throws unathorized error if authorization header is missing', () => {
      try {
        authorize({})
      } catch (e) {
        expect(e).toBeInstanceOf(createHttpError.HttpError)
        expect(e.status).toEqual(401)
        expect(e.message).toEqual('Unauthorized')
      }
    })

    test('it throws unathorized error if jwt.verity trows an error', () => {
      ;(jwt.verify as jest.Mock).mockImplementation(() => {
        throw Error('test fails')
      })
      try {
        authorize(headers)
      } catch (e) {
        expect(e.status).toEqual(401)
        expect(e.message).toEqual('test fails')
      }
    })

    test('it throws unathorized error if jwt.verity does not find a proper user', () => {
      ;(jwt.verify as jest.Mock).mockReturnValue('this string')

      try {
        authorize(headers)
      } catch (e) {
        expect(e).toBeInstanceOf(createHttpError.HttpError)
        expect(e.status).toEqual(401)
        expect(e.message).toEqual('Unauthorized')
      }
    })
  })
})
