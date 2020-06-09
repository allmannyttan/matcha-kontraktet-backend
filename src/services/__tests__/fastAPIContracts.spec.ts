import { client } from '@app/adapters/api'
import { fetchApiContracts } from '@app/services/fetchApiContracts'
import {
  getSelectionById,
  updateContract,
  addContractToSelection,
} from '@app/services/db'

jest.mock('@app/adapters/api')
jest.mock('@app/services/db')

describe('#fetchApiContracts', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ;(getSelectionById as jest.Mock).mockResolvedValue({
      selection_term: 'foo',
    })
    ;(client.get as jest.Mock).mockResolvedValue([{ foo: 'bar' }])
    ;(updateContract as jest.Mock).mockResolvedValue('1337')
  })

  test('it gets the selection from db', async () => {
    await fetchApiContracts('id')
    expect(getSelectionById).toHaveBeenCalledWith('id')
  })

  test('it calls client.get', async () => {
    await fetchApiContracts('id')
    expect(client.get).toHaveBeenCalledWith({
      url:
        'leasecontracts/?rentalid=foo*&includetenants=true&includerentals=true',
    })
  })

  test('it updates contracts in the database', async () => {
    await fetchApiContracts('id')
    expect(updateContract).toHaveBeenCalledWith({ foo: 'bar' })
  })

  test('it adds the contract to the selection in the database', async () => {
    await fetchApiContracts('id')
    expect(addContractToSelection).toHaveBeenCalledWith('1337', 'id')
  })
})
