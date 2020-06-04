import configPackage from '@iteam/config'

interface Postgres {
  host: string
  user: string
  password: string
  database: string
  port: number
}

interface API {
  baseUrl: string
  username: string
  password: string
}

export interface Config {
  port: number
  postgres: Postgres
  auth: {
    secret: string
    expiresIn: string
    maxFailedLoginAttempts: number
  }
  api: API
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
      port: 5442,
    },
    auth: {
      secret:
        'Kungen, Drottningen, Kronprinsessan och Prins Daniel höll i dag ett videomöte med Kungl. Vetenskapsakademien.',
      expiresIn: '3h', // format allowed by https://github.com/zeit/ms
      maxFailedLoginAttempts: 3,
    },
    api: {
      baseUrl: 'http://localhost:4000/',
      username: 'user',
      password: 'hejhej',
    },
  },
})

export default {
  auth: config.get('auth'),
  port: config.get('port'),
  postgres: config.get('postgres'),
  api: config.get('api'),
} as Config
