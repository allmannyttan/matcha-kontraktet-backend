exports.up = (knex) => {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.table('contracts', (table) => {
      table.timestamp('start_date')
    })
  )
}

exports.down = (knex) => {
  return knex.schema.table('contracts', (table) => {
    table.dropColumn('start_date')
  })
}
