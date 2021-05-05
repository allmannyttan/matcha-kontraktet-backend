exports.up = (knex) => {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.alterTable(
      'population_registration_sync_exceptions',
      (table) => {
        table.dropForeign('selection_id')
        table
          .foreign('selection_id')
          .references('selections.id')
          .onDelete('CASCADE')
      }
    )
  )
}

exports.down = (knex) => {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.alterTable(
      'population_registration_sync_exceptions',
      (table) => {
        table.dropForeign('selection_id')
        table.foreign('selection_id').references('selections.id')
      }
    )
  )
}
