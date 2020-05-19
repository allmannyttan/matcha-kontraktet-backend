import configPackage from '@iteam/config'

interface Postgres {
  host: string
  user: string
  password: string
  database: string
}

export interface Config {
  port: number
  postgres: Postgres
}

const config = configPackage({
  file: `${__dirname}/../config.json`,
  defaults: {
    port: 9000,
    postgres: {
      host: '127.0.0.1',
      user: 'iteamadmin',
      password: 'adminadmin1337',
      database: 'subletdetector',
    },
  },
})

export default {
  port: config.get('port'),
  postgres: config.get('postgres'),
} as Config
