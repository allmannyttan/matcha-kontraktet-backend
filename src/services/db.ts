import { Contract, Selection } from '@app/types'
import { db } from '@app/adapters/postgres'

export const insertSelection = async (
  selection_term: string,
  name: string,
  from: Date | null,
  to: Date | null,
  created_by: string
): Promise<Selection[]> => {
  return await db('selections').returning('*').insert({
    selection_term,
    name,
    from,
    to,
    created_by,
  })
}

export const deleteSelectionById = async (id: string): Promise<void> => {
  await db
    .select('*')
    .from('selection_contracts')
    .where('selection_id', id)
    .del()
  await db.select('*').from('selections').where('id', id).del()

  // Remove orphaned contracts
  return await db.raw(
    'delete from contracts where id not in (select contract_id from selection_contracts)'
  )
}

export const deleteContractById = async (
  contractId: string,
  selectionId: string
): Promise<void> => {
  await db
    .select('*')
    .from('selection_contracts')
    .where('contract_id', contractId)
    .andWhere('selection_id', selectionId)
    .del()

  // Remove orphaned contracts
  return await db.raw(
    'delete from contracts where id not in (select contract_id from selection_contracts)'
  )
}

export const getSelections = async (): Promise<Selection[]> => {
  return await db.select('*').from('selections')
}

export const getSelectionById = async (id: string): Promise<Selection> => {
  return await db.select('*').from('selections').where('id', id).first()
}

export const saveContract = async (c: Contract) => {
  await db('contracts').where('id', c.id).update(c)
}

export const logSyncFailure = async (id: string, user: string, error: any) => {
  return insertPopulationRegistrationSyncs(id, user, 'Failed ' + error.message)
}

export const logSyncSuccess = async (id: string, user: string) => {
  return insertPopulationRegistrationSyncs(id, user, 'Success')
}

export const insertPopulationRegistrationSyncs = async (
  selection_id: string,
  synced_by: string,
  result: string
) => {
  await db('population_registration_syncs').insert({
    selection_id,
    synced_by,
    result,
  })
}

export const getContractsForSelection = async (
  id: string
): Promise<Contract[]> => {
  return await db
    .select(
      'contracts.*',
      'population_registration_sync_exceptions.note as exception'
    )
    .from('contracts')
    .innerJoin(
      'selection_contracts',
      'contracts.id',
      'selection_contracts.contract_id'
    )
    .leftJoin(
      'population_registration_sync_exceptions',
      'contracts.id',
      'population_registration_sync_exceptions.contract_id'
    )
    .where('selection_contracts.selection_id', id)
}

export const setSelectionSynced = async (id: string) => {
  await db('selections').where('id', id).update({
    last_population_registration_lookup: db.fn.now(),
  })
}

export const updateContract = async (contract: any): Promise<string> => {
  const contractInDb = await db<Contract>('contracts')
    .where('contract_id', contract.id)
    .first()

  let address = contract.rentalObject?.rental?.addresses?.[0]?.street
  if (!address) {
    console.log(
      'Empty address',
      contract.id,
      JSON.stringify(contract.rentalObject?.rental, null, 2)
    )
  }

  if (contractInDb) {
    await db('contracts')
      .update({
        contract_information: {
          name: contract.partners?.[0]?.tenant?.fullName,
          pnr: contract.partners?.[0]?.tenant?.socialSecurityNumber,
          address:
            contract.rentalObject?.rental?.addresses?.[0]?.street || null,
        },
        start_date: contract.initialDate,
      })
      .where('id', contractInDb.id)

    return contractInDb.id
  }

  const [newId]: string[] = await db('contracts')
    .insert({
      contract_information: {
        name: contract.partners?.[0]?.tenant?.fullName,
        pnr: contract.partners?.[0]?.tenant?.socialSecurityNumber,
        address: contract.rentalObject?.rental?.addresses?.[0]?.street || null,
      },
      contract_id: contract.id,
      start_date: contract.initialDate,
    })
    .returning('id')

  return newId
}

export const addContractToSelection = async (
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

export const addContractSyncException = async (
  selectionId: string,
  contractId: string,
  note: string
) => {
  const existingException = await db('population_registration_sync_exceptions')
    .where({
      selection_id: selectionId,
      contract_id: contractId,
    })
    .first()

  if (!existingException) {
    return db('population_registration_sync_exceptions').insert({
      selection_id: selectionId,
      contract_id: contractId,
      note,
    })
  }
  return
}

export const updateTotalContractNumber = async (
  selectionId: string,
  totalContracts: number
) => {
  return db('selections')
    .update({
      total_contracts: totalContracts,
    })
    .where('id', selectionId)
}
