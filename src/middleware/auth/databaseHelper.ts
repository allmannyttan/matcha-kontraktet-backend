import { User } from '@app/helpers/types'
import SQL from 'sql-template-strings'
import { db } from '@app/adapters/postgres'

export const setUserFailedLoginAttempts = async (
  userId: number,
  attempts: number
): Promise<void> => {
  const sql = SQL`
    UPDATE "users" 
    SET failed_login_attempts = ${attempts}
    WHERE id = ${userId}
  `
  await db(sql)
}

export const setUserLocked = async (
  userId: number,
  locked: boolean
): Promise<void> => {
  const sql = SQL`
    UPDATE "users" 
    SET locked = ${locked}
    WHERE id = ${userId}
  `
  await db(sql)
}

export const getUser = async (username: string): Promise<User> => {
  const sql = SQL`
      SELECT
        id,
        username,
        password_hash as "passwordHash",
        salt,
        locked,
        disabled,
        failed_login_attempts as "failedLoginAttempts"
      FROM users
      WHERE username = ${username}
    `

  const [user] = await db<User>(sql)

  return user
}
