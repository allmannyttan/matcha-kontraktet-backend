import { client } from '../../adapters/api'
import { Contract } from '../../types'
import {
  getSelectionById,
  updateContract,
  addContractToSelection,
} from '../../services/db'

import { fetchApiContracts } from '../fetchApiContracts'

jest.mock('../../adapters/api')

jest.mock('../../services/db')

describe('fetchApiContracts', () => {
  test('calls getSelectionById', async () => {
    ;(client.get as jest.Mock).mockResolvedValueOnce([{ id: 1 }])
    ;(updateContract as jest.Mock).mockResolvedValueOnce('a9231923')
    ;(getSelectionById as jest.Mock).mockResolvedValueOnce({
      selection_term: 2,
    })

    await fetchApiContracts('1337')

    expect(getSelectionById).toBeCalledWith('1337')
  })

  test('gets selection', async () => {
    ;(client.get as jest.Mock).mockResolvedValueOnce([{ id: 1 }])
    ;(updateContract as jest.Mock).mockResolvedValueOnce('a9231923')
    ;(getSelectionById as jest.Mock).mockResolvedValueOnce({
      selection_term: 2,
    })

    await fetchApiContracts('1337')

    expect(client.get).toBeCalledWith({
      url:
        'leasecontracts/?includetenants=true&includerentals=true&rentalid=2*',
    })
  })

  test('doesnt include contracts that lacks socialsecuritynumber', async () => {
    ;(client.get as jest.Mock).mockResolvedValueOnce([{ id: 1 }])
    ;(updateContract as jest.Mock).mockResolvedValueOnce('a9231923')
    ;(getSelectionById as jest.Mock).mockResolvedValueOnce([
      { selection_term: 2 },
    ])

    await fetchApiContracts('1337')

    expect(updateContract).toHaveBeenCalledTimes(0)
  })

  test('calls updateContract', async () => {
    ;(client.get as jest.Mock).mockResolvedValueOnce([{ id: 1, partners: [ { tenant: { socialSecurityNumber: '1337'} }]  }])
    ;(updateContract as jest.Mock).mockResolvedValueOnce('a9231923')
    ;(getSelectionById as jest.Mock).mockResolvedValueOnce([
      { selection_term: 2 },
    ])

    await fetchApiContracts('1337')

    expect(updateContract).toBeCalledWith({ id: 1, partners: [ { tenant: { socialSecurityNumber: '1337'} }]  })
  })


  test('adds contract to selection', async () => {
    ;(client.get as jest.Mock).mockResolvedValueOnce([{ id: 1, partners: [ { tenant: { socialSecurityNumber: '1337'} }]  }])
    ;(updateContract as jest.Mock).mockResolvedValueOnce('a9231923')
    ;(getSelectionById as jest.Mock).mockResolvedValueOnce([
      { selection_term: 2 },
    ])

    await fetchApiContracts('1337')

    expect(addContractToSelection).toBeCalledWith('a9231923', '1337')
  })
})
