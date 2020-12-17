import { getInformation } from '../index'
import { createClientAsync } from 'soap'
import config from '@app/config'

jest.mock('soap')
jest.mock('@app/config', () => ({
  creditsafe: {
    username: 'ausername',
    password: 'apassword',
    basicBlock: 'basic_block',
  },
}))

describe('#Creditsafe', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ;(createClientAsync as jest.Mock).mockResolvedValue({
      GetData: {
        GetDataSoap: {
          GetDataBySecure: jest.fn(),
        },
      },
    })
  })

  describe('#getInformation', () => {
    test('it calls with formated personal numbers', () => {
      getInformation(['19121212-1212', '1212121212'])
      expect(createClientAsync).toHaveBeenCalledTimes(2)
    })
  })
})
