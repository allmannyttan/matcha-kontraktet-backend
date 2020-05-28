exports.up = (knex) => {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.createTable('selections', (table) => {
      table
        .uuid('id')
        .primary()
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
      table.string('selection_term', 128).notNullable()
      table.string('name', 128).notNullable().defaultTo('')
      table.timestamp('last_population_registration_lookup')
      table.string('created_by', 128).notNullable()
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    })
  )
}

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('selections')
}
