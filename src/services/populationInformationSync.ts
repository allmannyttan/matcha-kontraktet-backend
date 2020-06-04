import { getPopulationRegistrationInformation } from '@app/adapters/syna'
import { toSynaFormat, valid } from '@app/helpers/personnummer'
import {
  getAutomatedStatus,
  isStatusOverrideable,
} from '@app/helpers/populationRegistration'
import {
  getContractsForSelection,
  logSyncFailure,
  logSyncSuccess,
  saveContract,
  setSelectionSynced,
} from '@app/services/db'
import moment from 'moment'

export const syncSelection = async (id: string, user: string) => {
  try {
    const contracts = await getContractsForSelection(id)

    const validPnrs = contracts
      .filter((c) => valid(c.contract_information.pnr))
      .map((c) => c.contract_information.pnr)

    const info = await getPopulationRegistrationInformation(validPnrs)

    await Promise.all(
      contracts.map(async (c) => {
        const pri = info.find(
          (i) =>
            toSynaFormat(i.pnr) === toSynaFormat(c.contract_information.pnr)
        )
        if (pri) {
          c.last_population_registration_lookup = moment().toDate()
          c.population_registration_information = pri
          if (isStatusOverrideable(c.status)) {
            c.status = getAutomatedStatus(c.contract_information, pri)
          }
          //save contract
          await saveContract(c)
        }
      })
    )

    await logSyncSuccess(id, user)

    await setSelectionSynced(id)
  } catch (error) {
    await logSyncFailure(id, user, error)
    throw error
  }
}
