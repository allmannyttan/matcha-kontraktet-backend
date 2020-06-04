exports.up = (knex) => {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.alterTable('contracts', (table) => {
      table.json('contract_information').nullable().alter()
      table.json('population_registration_information').nullable().alter()
      table.string('status').nullable().alter()
      table.string('comment').nullable().alter()
    })
  )
}

exports.down = (knex) => {
  return knex.schema.alterTable('contracts', (table) => {
    table.json('contract_information').notNullable().alter()
    table.json('population_registration_information').notNullable().alter()
    table.string('status').notNullable().alter()
    table.string('comment').notNullable().alter()
  })
}
