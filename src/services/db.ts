import { Contract, Selection } from '@app/types'
import { db } from '@app/adapters/postgres'

export const insertSelection = async (
  selection_term: string,
  name: string,
  created_by: string
): Promise<Selection[]> => {
  return await db('selections').returning('*').insert({
    selection_term,
    name,
    created_by,
  })
}

export const deleteSelectionById = async (id: string): Promise<void> => {
  return await db.select('*').from('selections').where('id', id).del()
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
    .select('contracts.*')
    .from('contracts')
    .innerJoin(
      'selection_contracts',
      'contracts.id',
      'selection_contracts.contract_id'
    )
    .where('selection_contracts.selection_id', id)
}

export const setSelectionSynced = async (id: string) => {
  await db('selections').where('id', id).update({
    last_population_registration_lookup: db.fn.now(),
  })
}
