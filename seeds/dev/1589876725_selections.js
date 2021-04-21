exports.seed = async (knex) => {
  await knex('selections').del()

  return knex('selections').insert([
    {
      id: 'E573E422-DF27-4965-9440-52486CD9E54D',
      selection_term: '123-adv-345',
      created_by: 'Kalle Karlsson',
      total_contracts: 100,
    },
    {
      id: '76C179BB-7DB2-4DC3-A6BB-199A82E128B9',
      selection_term: '345-sdf-056',
      created_by: 'Pelle Andersson',
      total_contracts: 50,
    },
  ])
}
