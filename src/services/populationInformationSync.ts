import { getInformation as getSynaInformation } from '@app/adapters/syna'
import { getInformation as getCreditsafeInformation } from '@app/adapters/creditsafe'
import { format, valid } from '@app/helpers/personnummer'
import {
  getAutomatedStatus,
  areAddressesEqual,
} from '@app/helpers/populationRegistration'
import {
  getContractsForSelection,
  logSyncFailure,
  logSyncSuccess,
  saveContract,
  setSelectionSynced,
  deleteContractById,
  addContractSyncException,
} from '@app/services/db'
import { PopulationRegistrationInformation } from '@app/types'
import moment from 'moment'
import config from '@app/config'

const getPopulationRegistrationInformation = async (
  pnrs: string[]
): Promise<PopulationRegistrationInformation[]> => {
  try {
    switch (config.populationRegistrationProvider.toLocaleLowerCase()) {
      case 'syna':
        return getSynaInformation(pnrs)
      case 'creditsafe':
        return getCreditsafeInformation(pnrs)
      default:
        throw 'Could not find population registration provider, please check configuration.'
    }
  } catch (error) {
    console.error(error)

    return Promise.reject(error)
  }
}

export const syncSelection = async (
  selectionId: string,
  user: string,
  automaticDeletion = false
) => {
  try {
    const allContracts = await getContractsForSelection(selectionId)

    const contracts = allContracts.filter((c) =>
      valid(c.contract_information.pnr)
    )

    const validPnrs = contracts.map((c) => c.contract_information.pnr)

    const info = await getPopulationRegistrationInformation(validPnrs)

    await Promise.all(
      contracts.map(async (c) => {
        const pri = info.find(
          (i) => format(i.pnr) === format(c.contract_information.pnr)
        )
        if (!pri) {
          return
        }

        const personGotSecretIdentity = [
          'Personen har skyddade personuppgifter',
          'Skyddad',
        ].includes(pri?.exception as string)

        if (!!pri.exception && !personGotSecretIdentity) {
          await addContractSyncException(selectionId, c.id, pri.exception)
        }

        const isValid = areAddressesEqual(c.contract_information, pri)
        if ((isValid && automaticDeletion) || personGotSecretIdentity) {
          await deleteContractById(c.id, selectionId)
        } else {
          //save contract
          await saveContract({
            ...c,
            last_population_registration_lookup: moment().toDate(),
            population_registration_information: pri,
            status: !!c.status
              ? c.status
              : getAutomatedStatus(c.contract_information, pri),
          })
        }
      })
    )

    await logSyncSuccess(selectionId, user)

    await setSelectionSynced(selectionId)
  } catch (error) {
    console.log(error)
    await logSyncFailure(selectionId, user, error)
    throw error
  }
}
