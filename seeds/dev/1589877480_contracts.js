exports.seed = async (knex) => {
  await knex('contracts').del()

  return knex('contracts').insert([
    {
      contract_information: {
        name: 'Johanna Andersson',
        address: 'Vägen 1',
      },
      population_registration_information: {
        name: 'Johanna Andersson',
        address: 'Vägen 1',
      },
      status: 'VERIFIED',
      comment: '',
    },
    {
      contract_information: {
        name: 'Niklas Nilsson',
        address: 'Vägen 1',
      },
      population_registration_information: {
        name: 'Greta Karlsson',
        address: 'Vägen 1',
      },
      status: 'INVALID',
      comment: 'Har vidtagit åtgärd',
    },
  ])
}
