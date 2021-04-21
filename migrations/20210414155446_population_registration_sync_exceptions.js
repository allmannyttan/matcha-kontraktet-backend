exports.up = (knex) => {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.createTable(
      'population_registration_sync_exceptions',
      (table) => {
        table
          .uuid('id')
          .primary()
          .notNullable()
          .defaultTo(knex.raw('uuid_generate_v4()'))

        table.uuid('selection_id').notNullable()
        table.uuid('contract_id').notNullable()
        table.foreign('selection_id').references('selections.id')
        table.string('note')
      }
    )
  )
}

exports.down = (knex) => {
  return knex.schema.dropTableIfExists(
    'population_registration_sync_exceptions'
  )
}
