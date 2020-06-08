import { db } from '@app/adapters/postgres'
import { client } from '@app/adapters/api'
import { Contract } from '../types'
import { getSelectionById } from '@app/services/db'

const updateContractInDb = async (contract: any): Promise<string> => {
  let contractInDb = await db<Contract>('contracts')
    .where('contract_id', contract.id)
    .first()

  if (contractInDb) {
    await db('contracts')
      .update({
        contract_information: {
          name: contract.partners[0].tenant.fullName,
          pnr: contract.partners[0].tenant.socialSecurityNumber,
          address:
            contract.rentalObject &&
            contract.rentalObject.rental &&
            contract.rentalObject.rental.addresses
              ? contract.rentalObject.rental.addresses[0].street
              : null,
        },
      })
      .where('id', contractInDb.id)

    return contractInDb.id
  } else {
    const newId: string = await db('contracts')
      .insert({
        contract_information: {
          name: contract.partners[0].tenant.fullName,
          pnr: contract.partners[0].tenant.socialSecurityNumber,
          address:
            contract.rentalObject &&
            contract.rentalObject.rental &&
            contract.rentalObject.rental.addresses
              ? contract.rentalObject.rental.addresses[0]
              : null,
        },
        contract_id: contract.id,
      })
      .returning('id')

    return newId
  }
}

const addContractToSelection = async (
  contractDbId: string,
  selectionId: string
) => {
  const selectionContract = await db('selection_contracts')
    .where({
      selection_id: selectionId,
      contract_id: contractDbId,
    })
    .first()

  if (!selectionContract) {
    return await db('selection_contracts').insert({
      selection_id: selectionId,
      contract_id: contractDbId,
    })
  } else {
    return
  }
}

export const fetchApiContracts = async (selectionId: string) => {
  const selection = await getSelectionById(id)

  const contracts = await client.get({
    url: `leasecontracts/?rentalid=${selection.selection_term}*&includetenants=true&includerentals=true`,
  })

  for (const contract of contracts) {
    const dbId = await updateContractInDb(contract)
    addContractToSelection(dbId, id)
  }

  return contracts.length
}
