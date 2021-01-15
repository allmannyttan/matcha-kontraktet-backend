exports.up = function (knex) {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.table('selections', (table) => {
      table.timestamp('from').nullable()
      table.timestamp('to').nullable()
      table.string('selection_term', 128).nullable().alter()
    })
  )
}

exports.down = function (knex) {
  return knex.schema.table('selections', (table) => {
    table.dropColumn('from')
    table.dropColumn('to')
  })
}
