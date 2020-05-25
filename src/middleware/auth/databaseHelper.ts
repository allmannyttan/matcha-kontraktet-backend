import { User } from '@app/helpers/types'
import { db } from '@app/adapters/postgres'

export const setUserFailedLoginAttempts = async (
  userId: number,
  attempts: number
): Promise<void> => {
  await db('users')
    .where('id', userId)
    .update({ failed_login_attempts: attempts })
}

export const setUserLocked = async (
  userId: number,
  locked: boolean
): Promise<void> => {
  await db('users').where('id', userId).update({ locked: locked })
}

export const getUser = async (username: string): Promise<User> => {
  const [user] = await db
    .select(
      'id',
      'username',
      'password_hash as passwordHash',
      'salt',
      'locked',
      'disabled',
      'failed_login_attempts as failedLoginAttempts'
    )
    .from<User>('users')
    .where('username', username)

  return user
}
