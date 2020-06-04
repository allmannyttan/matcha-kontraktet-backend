exports.up = (knex) => {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.createTable('contracts', (table) => {
      table
        .uuid('id')
        .primary()
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
      table.json('contract_information').notNullable()
      table.json('population_registration_information')
      table.timestamp('last_population_registration_lookup')
      table.string('status', 128).notNullable()
      table.string('comment', 128).notNullable().defaultTo('')
    })
  )
}

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('contracts')
}
