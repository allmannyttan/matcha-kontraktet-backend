exports.up = (knex) => {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.table('contracts', (table) => {
      table.string('contract_id', 128)
      table.json('status_history')
      table.timestamp('status_changed')
    })
  )
}

exports.down = (knex) => {
  return knex.schema.table('contracts', (table) => {
    table.dropColumn('status_changed')
    table.dropColumn('status_history')
    table.dropColumn('contract_id')
  })
}
