exports.up = (knex) => {
  return knex
    .raw('create extension if not exists "uuid-ossp"')
    .then(() => knex.select('*').from('contracts'))
    .then((contracts) =>
      contracts.map((c) => ({
        ...c,
        contract_information: JSON.stringify([c.contract_information]),
        population_registration_information: JSON.stringify([
          c.population_registration_information,
        ]),
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
          contract_information: JSON.stringify(contractInformation),
          population_registration_information: JSON.stringify(
            populationRegistrationInformation
          ),
        }
      })
    )
    .then((contracts) =>
      Promise.all(
        contracts.map((c) => knex('contracts').where('id', c.id).update(c))
      )
    )
}
