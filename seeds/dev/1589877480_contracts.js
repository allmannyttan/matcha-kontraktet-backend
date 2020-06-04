exports.seed = async (knex) => {
  await knex('contracts').del()

  return knex('contracts').insert([
    {
      id: '30F613FF-527A-4E6A-A49C-1F2F3CA965CA',
      contract_information: {
        pnr: '19121212-1212',
        name: 'Johanna Andersson',
        address: 'Vägen 1',
      },
      population_registration_information: {
        pnr: '19121212-1212',
        name: 'Johanna Andersson',
        address: 'Vägen 1',
      },
      status: 'VERIFIED',
      comment: '',
    },
    {
      id: '3A292AFA-0140-470B-BBE6-52A0CE22FDD2',
      contract_information: {
        pnr: '7505310438',
        name: 'Martin Loman',
        address: 'Vägen 1',
      },
      population_registration_information: {
        pnr: '7505310438',
        name: 'Maaaartin',
        address: 'Vägen 2 i en annan stad',
      },
      status: 'INVALID',
      comment: 'Har vidtagit åtgärd',
    },
  ])
}
