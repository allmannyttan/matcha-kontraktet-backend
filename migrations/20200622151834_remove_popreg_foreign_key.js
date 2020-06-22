exports.up = (knex) => {
  return knex.raw('create extension if not exists "uuid-ossp"').then(() =>
    knex.schema.table('population_registration_syncs', (table) => {
      return table.dropForeign(
        'selections_pkey',
        'population_registration_syncs_selection_id_foreign'
      )
    })
  )
}

exports.down = (knex) => {
  return knex.schema.table('population_registration_syncs', (table) => {
    return table.foreign('selection_id').references('selections.id')
  })
}
