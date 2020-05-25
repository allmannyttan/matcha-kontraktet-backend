import configPackage from '@iteam/config'

interface Postgres {
  host: string
  user: string
  password: string
  database: string
  port: number
}

export interface Config {
  port: number
  postgres: Postgres
  auth: {
    secret: string
    expiresIn: string
    maxFailedLoginAttempts: number
  }
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
  },
})

export default {
  port: config.get('port'),
  postgres: config.get('postgres'),
} as Config
