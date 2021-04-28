import { getInformation as getInformationCreditsafe } from '@app/adapters/creditsafe'
import { getInformation as getInformationSyna } from '@app/adapters/syna'
import {
  getAutomatedStatus,
  isStatusOverrideable,
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
import { syncSelection } from '../populationInformationSync'

import { db } from '@app/adapters/postgres'

jest.mock('@app/services/db')
jest.mock('@app/adapters/syna')
jest.mock('@app/adapters/creditsafe')
jest.mock('@app/helpers/populationRegistration')
jest.mock('moment', () => () => ({ toDate: () => 'a mocked date' }))

import config from '@app/config'

jest.mock('@app/config', () => ({
  ...jest.requireActual('@app/config').default,
  populationRegistrationProvider: {
    toLocaleLowerCase: jest.fn(),
  },
}))

describe('#syncSelection', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ;(getContractsForSelection as jest.Mock).mockResolvedValue([
      {
        contract_information: { pnr: 'test pnr' },
      },
    ])
    ;(getInformationCreditsafe as jest.Mock).mockResolvedValue([])
    ;(getInformationSyna as jest.Mock).mockResolvedValue([])
    ;(saveContract as jest.Mock).mockResolvedValue({})
    ;(logSyncFailure as jest.Mock).mockResolvedValue({})
    ;(logSyncSuccess as jest.Mock).mockResolvedValue({})
    ;(setSelectionSynced as jest.Mock).mockResolvedValue({})
    ;(config.populationRegistrationProvider
      .toLocaleLowerCase as jest.Mock).mockReturnValue('syna')
    return db.raw('truncate table population_registration_sync_exceptions')
  })

  test('it gets contracts for selection', async () => {
    await syncSelection('id', 'user')
    expect(getContractsForSelection).toHaveBeenCalledWith('id')
  })

  test('it removes invalid pnrs', async () => {
    ;(getContractsForSelection as jest.Mock).mockResolvedValue([
      { contract_information: { pnr: 'invalid pnr' } },
      { contract_information: { pnr: '191212121212' } },
    ])

    await syncSelection('id', 'user')
    expect(getInformationSyna).toHaveBeenCalledWith(['191212121212'])
  })

  test('it matches pnr and saves contract with info from population registration', async () => {
    const pnr = '191212121212'
    const contract_information = { pnr, address: 'an address' }
    const population_registration_information = {
      address: 'pri address',
      pnr: '191212121212',
    }
    ;(getAutomatedStatus as jest.Mock).mockReturnValue('A MOCKED STATUS')
    ;(isStatusOverrideable as jest.Mock).mockReturnValue(true)
    ;(getContractsForSelection as jest.Mock).mockResolvedValue([
      { contract_information },
    ])
    ;(getInformationSyna as jest.Mock).mockResolvedValue([
      population_registration_information,
    ])

    await syncSelection('id', 'user')
    expect(saveContract).toHaveBeenCalledWith({
      contract_information,
      last_population_registration_lookup: 'a mocked date',
      population_registration_information,
      status: 'A MOCKED STATUS',
    })
  })

  test('it does not save contract population registration', async () => {
    const pnr = '191212121212'
    const contract_information = { pnr, address: 'an address' }
    const population_registration_information = {
      address: 'pri address',
      pnr: '191212121212',
    }
    ;(getAutomatedStatus as jest.Mock).mockReturnValue('A MOCKED STATUS')
    ;(isStatusOverrideable as jest.Mock).mockReturnValue(true)
    ;(getContractsForSelection as jest.Mock).mockResolvedValue([
      { contract_information },
    ])
    ;(getInformationSyna as jest.Mock).mockResolvedValue([
      population_registration_information,
    ])

    await syncSelection('id', 'user')
    expect(saveContract).toHaveBeenCalledWith({
      contract_information,
      last_population_registration_lookup: 'a mocked date',
      population_registration_information,
      status: 'A MOCKED STATUS',
    })
  })

  test('it does not override a status when contract has it set already', async () => {
    const pnr = '191212121212'
    const contract_information = { pnr, address: 'an address' }
    const population_registration_information = {
      address: 'pri address',
      pnr: '191212121212',
    }
    ;(getAutomatedStatus as jest.Mock).mockReturnValue('VALID')
    ;(isStatusOverrideable as jest.Mock).mockReturnValue(false)
    ;(getContractsForSelection as jest.Mock).mockResolvedValue([
      { contract_information, status: 'NOT OVERRIDEABLE' },
    ])
    ;(getInformationSyna as jest.Mock).mockResolvedValue([
      population_registration_information,
    ])

    await syncSelection('id', 'user')
    expect(saveContract).toHaveBeenCalledWith({
      contract_information,
      last_population_registration_lookup: 'a mocked date',
      population_registration_information,
      status: 'NOT OVERRIDEABLE',
    })
  })

  test('it finds pnrs with different formats', async () => {
    const pnr = '19121212-1212'
    const contract_information = { pnr, address: 'an address' }
    const population_registration_information = {
      address: 'pri address',
      pnr: '191212121212',
    }
    ;(getAutomatedStatus as jest.Mock).mockReturnValue('A MOCKED STATUS')
    ;(isStatusOverrideable as jest.Mock).mockReturnValue(true)
    ;(getContractsForSelection as jest.Mock).mockResolvedValue([
      { contract_information },
    ])
    ;(getInformationSyna as jest.Mock).mockResolvedValue([
      population_registration_information,
    ])

    await syncSelection('id', 'user')
    expect(saveContract).toHaveBeenCalledWith({
      contract_information,
      last_population_registration_lookup: 'a mocked date',
      population_registration_information,
      status: 'A MOCKED STATUS',
    })
  })

  test('it logs success', async () => {
    ;(getInformationSyna as jest.Mock).mockResolvedValue([])

    await syncSelection('id', 'user')
    expect(logSyncSuccess).toHaveBeenCalledWith('id', 'user')
    expect(setSelectionSynced).toHaveBeenCalledWith('id')
  })

  test('it logs failure when something fails and throws error', async () => {
    ;(getInformationSyna as jest.Mock).mockImplementation(() => {
      throw new Error('test')
    })

    try {
      await syncSelection('id', 'user')
    } catch (e) {
      expect(logSyncFailure).toHaveBeenCalledWith('id', 'user', e)
    }
  })

  test('it does NOT save valids when you set onlyInvalid', async () => {
    const pnr = '191212121212'
    const contract_information = { pnr, address: 'an address' }
    const population_registration_information = {
      address: 'pri address',
      pnr: '191212121212',
    }
    ;(getAutomatedStatus as jest.Mock).mockReturnValue('A MOCKED STATUS')
    ;(areAddressesEqual as jest.Mock).mockReturnValue(true)
    ;(isStatusOverrideable as jest.Mock).mockReturnValue(true)
    ;(getContractsForSelection as jest.Mock).mockResolvedValue([
      { contract_information, status: 'CAN BE OVERRIDDEN' },
    ])
    ;(getInformationSyna as jest.Mock).mockResolvedValue([
      population_registration_information,
    ])

    await syncSelection('id', 'user', true)
    expect(saveContract).toBeCalledTimes(0)
  })

  test('it does save invalids when you set onlyInvalid', async () => {
    const pnr = '191212121212'
    const contract_information = { pnr, address: 'an address' }
    const population_registration_information = {
      address: 'pri address',
      pnr: '191212121212',
    }
    ;(getAutomatedStatus as jest.Mock).mockReturnValue(false)
    ;(areAddressesEqual as jest.Mock).mockReturnValueOnce(false)
    ;(isStatusOverrideable as jest.Mock).mockReturnValue(true)
    ;(getContractsForSelection as jest.Mock).mockResolvedValue([
      { contract_information, status: 'CAN BE OVERRIDDEN' },
    ])
    ;(getInformationSyna as jest.Mock).mockResolvedValue([
      population_registration_information,
    ])

    await syncSelection('id', 'user', true)
    expect(saveContract).toBeCalledTimes(1)
  })

  test('it deletes valids when only invalids', async () => {
    const pnr = '191212121212'
    const contract_information = { pnr, address: 'an address' }
    const population_registration_information = {
      address: 'pri address',
      pnr: '191212121212',
    }
    ;(getAutomatedStatus as jest.Mock).mockReturnValue('A MOCKED STATUS')
    ;(areAddressesEqual as jest.Mock).mockReturnValue(true)
    ;(isStatusOverrideable as jest.Mock).mockReturnValue(true)
    ;(getContractsForSelection as jest.Mock).mockResolvedValue([
      { contract_information, id: '1339', status: 'CAN BE OVERRIDDEN' },
    ])
    ;(getInformationSyna as jest.Mock).mockResolvedValue([
      population_registration_information,
    ])

    await syncSelection('id', 'user', true)
    expect(deleteContractById).toBeCalledWith('1339', 'id')
  })

  test('it stores contract sync exceptions', async () => {
    const pnr = '191212121212'
    const contract_id = '4a26d023-2b74-4073-bcaf-9426d7827e93'
    const selection_id = '76c179bb-7db2-4dc3-a6bb-199a82e128b9'
    const contract_information = { pnr, address: 'an address' }
    const population_registration_information = {
      pnr: '191212121212',
      exception: 'Särskild postadress utländsk',
    }
    ;(getAutomatedStatus as jest.Mock).mockReturnValue('VALID')
    ;(isStatusOverrideable as jest.Mock).mockReturnValue(false)
    ;(getContractsForSelection as jest.Mock).mockResolvedValue([
      { id: contract_id, contract_information, status: 'NOT OVERRIDEABLE' },
    ])
    ;(getInformationSyna as jest.Mock).mockResolvedValue([
      population_registration_information,
    ])

    await syncSelection(selection_id, 'user_id', true)

    expect(addContractSyncException).toHaveBeenCalledWith(
      selection_id,
      contract_id,
      population_registration_information.exception
    )
  })

  test('it does not store contract sync exceptions when there are none', async () => {
    const pnr = '191212121212'
    const contract_id = '4a26d023-2b74-4073-bcaf-9426d7827e93'
    const selection_id = '76c179bb-7db2-4dc3-a6bb-199a82e128b9'
    const contract_information = { pnr, address: 'an address' }
    const population_registration_information = {
      pnr: '191212121212',
      exception: null,
    }
    ;(getAutomatedStatus as jest.Mock).mockReturnValue('VALID')
    ;(isStatusOverrideable as jest.Mock).mockReturnValue(false)
    ;(getContractsForSelection as jest.Mock).mockResolvedValue([
      { id: contract_id, contract_information, status: 'NOT OVERRIDEABLE' },
    ])
    ;(getInformationSyna as jest.Mock).mockResolvedValue([
      population_registration_information,
    ])

    await syncSelection(selection_id, 'user_id', true)

    expect(addContractSyncException).toBeCalledTimes(0)
  })

  test('it does not add exception and deletes contract for protected persons for Syna', async () => {
    const pnr = '191212121212'
    const contract_id = '4a26d023-2b74-4073-bcaf-9426d7827e93'
    const selection_id = '76c179bb-7db2-4dc3-a6bb-199a82e128b9'
    const contract_information = { pnr, address: 'an address' }
    const population_registration_information = {
      pnr: '191212121212',
      exception: 'Personen har skyddade personuppgifter',
    }
    ;(getAutomatedStatus as jest.Mock).mockReturnValue('VALID')
    ;(isStatusOverrideable as jest.Mock).mockReturnValue(false)
    ;(getContractsForSelection as jest.Mock).mockResolvedValue([
      { id: contract_id, contract_information, status: 'NOT OVERRIDEABLE' },
    ])
    ;(getInformationSyna as jest.Mock).mockResolvedValue([
      population_registration_information,
    ])

    await syncSelection(selection_id, 'user_id', true)

    expect(addContractSyncException).toBeCalledTimes(0)
    expect(deleteContractById).toHaveBeenCalledWith(contract_id, selection_id)
  })

  test('it does not add exception and deletes contract for protected persons for Creditsafe', async () => {
    const pnr = '191212121212'
    const contract_id = '4a26d023-2b74-4073-bcaf-9426d7827e93'
    const selection_id = '76c179bb-7db2-4dc3-a6bb-199a82e128b9'
    const contract_information = { pnr, address: 'an address' }
    const population_registration_information = {
      pnr: '191212121212',
      exception: 'Skyddad',
    }
    ;(getAutomatedStatus as jest.Mock).mockReturnValue('VALID')
    ;(isStatusOverrideable as jest.Mock).mockReturnValue(false)
    ;(getContractsForSelection as jest.Mock).mockResolvedValue([
      { id: contract_id, contract_information, status: 'NOT OVERRIDEABLE' },
    ])
    ;(getInformationCreditsafe as jest.Mock).mockResolvedValue([
      population_registration_information,
    ])
    ;(config.populationRegistrationProvider
      .toLocaleLowerCase as jest.Mock).mockReturnValue('creditsafe')

    await syncSelection(selection_id, 'user_id', true)

    expect(addContractSyncException).toBeCalledTimes(0)
    expect(deleteContractById).toHaveBeenCalledWith(contract_id, selection_id)
  })
})
