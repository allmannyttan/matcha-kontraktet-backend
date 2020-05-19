module.exports = {
  client: 'pg',
  dev: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      database: 'subletdetector',
      user: 'iteamadmin',
      password: 'adminadmin1337',
      port: 5442,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds/dev',
    },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      tableName: 'knex_migrations',
    },
  },
}
