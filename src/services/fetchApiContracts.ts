import { client } from '@app/adapters/api'
import { Contract } from '../types'
import {
  getSelectionById,
  updateContract,
  addContractToSelection,
} from '@app/services/db'

export const fetchApiContracts = async (selectionId: string) => {
  const selection = await getSelectionById(selectionId)

  const contracts = await client.get({
    url: `leasecontracts/?rentalid=${selection.selection_term}*&includetenants=true&includerentals=true`,
  })

  for (const contract of contracts) {
    const dbId = await updateContract(contract)
    addContractToSelection(dbId, selectionId)
  }

  return contracts.length
}
