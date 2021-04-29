import { client } from '@app/adapters/api'
import {
  getSelectionById,
  updateContract,
  addContractToSelection,
  updateTotalContractNumber,
} from '@app/services/db'

export const fetchApiContracts = async (selectionId: string) => {
  const { selection_term, from, to } = await getSelectionById(selectionId)

  const allContracts = await client.get({
    url: `leasecontracts/?includetenants=true&includerentals=true${
      selection_term ? `&rentalid=${selection_term}*` : ''
    }${from ? `&from=${new Date(from).toISOString()}` : ''}${
      to ? `&to=${new Date(to).toISOString()}` : ''
    }`,
  })

  const contracts = allContracts.filter(
    (contract: any) => !!contract.partners?.[0]?.tenant?.socialSecurityNumber
  )
  for (const contract of contracts) {
    const dbId = await updateContract(contract)
    await addContractToSelection(dbId, selectionId)
  }

  updateTotalContractNumber(selectionId, contracts.length)

  return contracts.length
}
