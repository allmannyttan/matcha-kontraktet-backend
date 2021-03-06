import { fetchAndSyncSelection } from '../selection'
import { fetchApiContracts } from '@app/services/fetchApiContracts'
import { syncSelection } from '@app/services/populationInformationSync'

jest.mock('@app/services/fetchApiContracts')
jest.mock('@app/services/populationInformationSync')
jest.mock('@app/config', () => ({
  postgres: {},
  onlyInvalid: true,
}))

describe('#fetchAndSyncSelection()', () => {
  let req: any, res: any, next: jest.Mock
  beforeEach(() => {
    next = jest.fn()

    req = {
      params: {
        id: 1337,
      },
      auth: {
        username: 'abba',
      },
    }

    res = {
      send: jest.fn(),
    }
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('it fetches api contracts with correct params', async () => {
    await fetchAndSyncSelection(req, res, next)
    expect(fetchApiContracts).toHaveBeenCalledWith(1337)
  })
  test('it syncs against folkbokföring with correct params', async () => {
    await fetchAndSyncSelection(req, res, next)
    expect(syncSelection).toHaveBeenCalledWith(1337, 'abba', true)
  })

  test('it returns success if all went ok', async () => {
    await fetchAndSyncSelection(req, res, next)
    expect(res.send).toHaveBeenCalledWith({
      data: {
        success: true,
      },
    })
  })

  test('it logs if there is an error', async () => {
    ;(fetchApiContracts as jest.Mock).mockRejectedValue(new Error('errorish'))
    await fetchAndSyncSelection(req, res, next)
    expect(next).toHaveBeenCalledWith(new Error('errorish'))
  })
})
