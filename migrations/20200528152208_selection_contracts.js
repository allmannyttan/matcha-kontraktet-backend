exports.up = (knex) => {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.createTable('selection_contracts', (table) => {
      table.uuid('selection_id').notNullable()
      table.foreign('selection_id').references('selections.id')
      table.uuid('contract_id').notNullable()
      table.foreign('contract_id').references('contracts.id')
      table.primary(['selection_id', 'contract_id'], 'pk_selection_contracts')
    })
  )
}

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('selection_contracts')
}
