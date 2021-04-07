exports.up = (knex) => {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.table('selections', (table) => {
      table.integer('total_contracts').notNullable().defaultTo(0)
    })
  )
}

exports.down = (knex) => {
  return knex.schema.table('selections', (table) => {
    table.dropColumn('total_contracts')
  })
}
