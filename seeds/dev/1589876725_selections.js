exports.seed = async (knex) => {
  await knex('selections').del()

  return knex('selections').insert([
    {
      selection_term: '123-adv-345',
      created_by: 'Kalle Karlsson',
    },
    {
      selection_term: '345-sdf-056',
      created_by: 'Pelle Andersson',
    },
  ])
}
