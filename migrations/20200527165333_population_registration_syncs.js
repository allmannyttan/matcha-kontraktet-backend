exports.up = (knex) => {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.createTable('population_registration_syncs', (table) => {
      table
        .uuid('id')
        .primary()
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
      table.uuid('selection_id').notNullable()
      table.foreign('selection_id').references('selections.id')
      table.timestamp('synced').notNullable().defaultTo(knex.fn.now())
      table.string('synced_by', 128).notNullable()
      table.string('result', 500).notNullable()
    })
  )
}

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('population_registration_syncs')
}
