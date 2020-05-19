import knex from 'knex'
import config from '@app/config'

export const db = knex({
  client: 'pg',
  connection: {
    host: config.postgres.host,
    user: config.postgres.user,
    password: config.postgres.password,
    database: config.postgres.database,
    timezone: 'UTC',
    dateStrings: true,
  },
})
