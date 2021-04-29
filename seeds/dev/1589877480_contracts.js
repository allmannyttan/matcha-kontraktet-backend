exports.seed = async (knex) => {
  await knex('contracts').del()

  return knex('contracts').insert([
    {
      id: '30F613FF-527A-4E6A-A49C-1F2F3CA965CA',
      contract_information: JSON.stringify([
        {
          pnr: '19121212-1212',
          name: 'Johanna Andersson',
          address: 'Vägen 1',
        },
      ]),
      population_registration_information: JSON.stringify([
        {
          pnr: '19121212-1212',
          name: 'Johanna Andersson',
          address: 'Vägen 1',
        },
      ]),
      status: 'VERIFIED',
      comment: '',
    },
    {
      id: '3A292AFA-0140-470B-BBE6-52A0CE22FDD2',
      contract_information: JSON.stringify([
        {
          pnr: '7505310438',
          name: 'Martin Loman',
          address: 'Vägen 1',
        },
      ]),
      population_registration_information: JSON.stringify([
        {
          pnr: '7505310438',
          name: 'Maaaartin',
          address: 'Vägen 2 i en annan stad',
        },
      ]),
      status: 'INVALID',
      comment: 'Har vidtagit åtgärd',
      start_date: new Date('2020-02-10'),
    },
    {
      id: 'af5ff16e-9a4d-4435-b22e-61787002737b',
      contract_information: JSON.stringify([
        {
          pnr: '7505310438',
          name: 'Anna Andersson',
          address: 'Vägen 1',
        },
      ]),
      population_registration_information: JSON.stringify([
        {
          pnr: '7505310438',
          name: 'Maaaartin',
          address: 'Vägen 2 i en annan stad',
        },
      ]),
      status: 'INVALID',
      comment: 'Har vidtagit åtgärd',
      start_date: new Date('2019-02-10'),
    },
    {
      id: '8d052252-43ac-4ee1-9186-94e2b933f43a',
      contract_information: JSON.stringify([
        {
          pnr: '7505310438',
          name: 'Bertil Bertilsson',
          address: 'Vägen 1',
        },
      ]),
      population_registration_information: JSON.stringify([
        {
          pnr: '7505310438',
          name: 'Maaaartin',
          address: 'Vägen 2 i en annan stad',
        },
      ]),
      status: 'INVALID',
      comment: 'Har vidtagit åtgärd',
      start_date: new Date('2019-03-10'),
    },
    {
      id: '4bb1e4cb-675f-4a3e-910c-7f90af59f446',
      contract_information: JSON.stringify([
        {
          pnr: '7505310438',
          name: 'Chris Christersson',
          address: 'Vägen 1',
        },
      ]),
      population_registration_information: JSON.stringify([
        {
          pnr: '7505310438',
          name: 'Maaaartin',
          address: 'Vägen 2 i en annan stad',
        },
      ]),
      status: 'INVALID',
      comment: 'Har vidtagit åtgärd',
      start_date: new Date('2016-03-10'),
    },
  ])
}
