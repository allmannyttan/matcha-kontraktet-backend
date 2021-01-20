import { getInformation } from '@app/adapters/syna'
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
} from '@app/services/db'
import { syncSelection } from '../populationInformationSync'

jest.mock('@app/services/db')
jest.mock('@app/adapters/syna')
jest.mock('@app/helpers/populationRegistration')
jest.mock('moment', () => () => ({ toDate: () => 'a mocked date' }))

describe('#syncSelection', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ;(getContractsForSelection as jest.Mock).mockResolvedValue([
      {
        contract_information: { pnr: 'test pnr' },
      },
    ])
    ;(getInformation as jest.Mock).mockResolvedValue([])
    ;(saveContract as jest.Mock).mockResolvedValue({})
    ;(logSyncFailure as jest.Mock).mockResolvedValue({})
    ;(logSyncSuccess as jest.Mock).mockResolvedValue({})
    ;(setSelectionSynced as jest.Mock).mockResolvedValue({})
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
    expect(getInformation).toHaveBeenCalledWith(['191212121212'])
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
      { contract_information, status: 'CAN BE OVERRIDDEN' },
    ])
    ;(getInformation as jest.Mock).mockResolvedValue([
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
      { contract_information, status: 'CAN BE OVERRIDDEN' },
    ])
    ;(getInformation as jest.Mock).mockResolvedValue([
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

  test('it does not override a status that should not be overridden', async () => {
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
    ;(getInformation as jest.Mock).mockResolvedValue([
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
      { contract_information, status: 'OVERRIDABLE' },
    ])
    ;(getInformation as jest.Mock).mockResolvedValue([
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
    ;(getInformation as jest.Mock).mockResolvedValue([])

    await syncSelection('id', 'user')
    expect(logSyncSuccess).toHaveBeenCalledWith('id', 'user')
    expect(setSelectionSynced).toHaveBeenCalledWith('id')
  })

  test('it logs failure when something fails and throws error', async () => {
    ;(getInformation as jest.Mock).mockImplementation(() => {
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
    ;(getInformation as jest.Mock).mockResolvedValue([
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
    ;(getInformation as jest.Mock).mockResolvedValue([
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
    ;(getInformation as jest.Mock).mockResolvedValue([
      population_registration_information,
    ])

    await syncSelection('id', 'user', true)
    expect(deleteContractById).toBeCalledWith('1339', 'id')
  })
})
