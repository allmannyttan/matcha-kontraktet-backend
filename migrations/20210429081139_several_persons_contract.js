exports.up = (knex) => {
  return knex
    .raw('create extension if not exists "uuid-ossp"')
    .then(() => knex.select('*').from('contracts'))
    .then((contracts) =>
      contracts.map((c) => ({
        ...c,
        contract_information: c.contract_information
          ? JSON.stringify([c.contract_information])
          : null,
        population_registration_information: c.population_registration_information
          ? JSON.stringify([c.population_registration_information])
          : null,
      }))
    )
    .then((contracts) =>
      Promise.all(
        contracts.map((c) => knex('contracts').where('id', c.id).update(c))
      )
    )
}

exports.down = (knex) => {
  return knex
    .raw('create extension if not exists "uuid-ossp"')
    .then(() => knex.select('*').from('contracts'))
    .then((contracts) =>
      contracts.map((c) => {
        const {
          contract_information: [contractInformation],
          population_registration_information: [
            populationRegistrationInformation,
          ],
        } = c
        return {
          ...c,
          contract_information: contractInformation
            ? JSON.stringify(contractInformation)
            : null,
          population_registration_information: populationRegistrationInformation
            ? JSON.stringify(populationRegistrationInformation)
            : null,
        }
      })
    )
    .then((contracts) =>
      Promise.all(
        contracts.map((c) => knex('contracts').where('id', c.id).update(c))
      )
    )
}
