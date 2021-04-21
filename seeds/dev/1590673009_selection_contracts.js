exports.seed = async (knex) => {
  await knex('selection_contracts').del()

  return knex('selection_contracts').insert([
    {
      selection_id: 'E573E422-DF27-4965-9440-52486CD9E54D',
      contract_id: '30F613FF-527A-4E6A-A49C-1F2F3CA965CA',
    },
    {
      selection_id: '76C179BB-7DB2-4DC3-A6BB-199A82E128B9',
      contract_id: '3A292AFA-0140-470B-BBE6-52A0CE22FDD2',
    },
    {
      selection_id: '76C179BB-7DB2-4DC3-A6BB-199A82E128B9',
      contract_id: 'af5ff16e-9a4d-4435-b22e-61787002737b',
    },
    {
      selection_id: '76C179BB-7DB2-4DC3-A6BB-199A82E128B9',
      contract_id: '8d052252-43ac-4ee1-9186-94e2b933f43a',
    },
    {
      selection_id: '76C179BB-7DB2-4DC3-A6BB-199A82E128B9',
      contract_id: '4bb1e4cb-675f-4a3e-910c-7f90af59f446',
    },
  ])
}
