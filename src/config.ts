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

interface Syna {
  host: string
  username: string
  customerNumber: string
  callingIpAddress: string
  batchSize: number
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
  syna: Syna
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
    syna: {
      host: 'https://arkivet.syna.se',
      callingIpAddress: '80.244.206.18',
      batchSize: 100,
    },
  },
})

export default {
  auth: config.get('auth'),
  port: config.get('port'),
  postgres: config.get('postgres'),
  api: config.get('api'),
  syna: config.get('syna'),
} as Config
