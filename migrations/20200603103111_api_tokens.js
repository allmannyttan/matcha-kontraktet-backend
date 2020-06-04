exports.up = (knex) => {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.createTable('api_tokens', (table) => {
      table
        .uuid('id')
        .primary()
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
      table.string('token_value', 256)
      table.timestamp('created').defaultTo(knex.fn.now())
    })
  )
}

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('api_tokens')
}
