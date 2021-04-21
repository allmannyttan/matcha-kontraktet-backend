import { client } from '@app/adapters/api'
import {
  getSelectionById,
  updateContract,
  addContractToSelection,
  updateTotalContractNumber,
} from '@app/services/db'

export const fetchApiContracts = async (selectionId: string) => {
  const { selection_term, from, to } = await getSelectionById(selectionId)

  const url = `leasecontracts/?includetenants=true&includerentals=true${
    selection_term ? `&rentalid=${selection_term}*` : ''
  }${from ? `&from=${new Date(from).toISOString()}` : ''}${
    to ? `&to=${new Date(to).toISOString()}` : ''
  }`

  const contracts = await client.get({
    url: url,
  })

  // console.log('contracts', contracts)

  for (const contract of contracts) {
    const dbId = await updateContract(contract)
    addContractToSelection(dbId, selectionId)
  }

  updateTotalContractNumber(selectionId, contracts.length)

  return contracts.length
}
