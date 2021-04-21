import { getInformation } from '../index'
import { createClientAsync } from 'soap'

jest.mock('soap')
jest.mock('@app/config', () => ({
  creditsafe: {
    username: 'ausername',
    password: 'apassword',
    basicBlock: 'basic_block',
  },
}))

describe('#Creditsafe', () => {
  let creditSafeReply: any
  let creditSafeError: any
  let creditSafe: any
  let pnrs: string[]

  beforeEach(() => {
    pnrs = ['1212121212']
    creditSafeReply = {
      GetDataBySecureResult: {
        Parameters: {
          diffgram: {
            NewDataSet: {
              GETDATA_RESPONSE: [],
            },
          },
        },
      },
    }

    creditSafeError = null

    creditSafe = {
      GetData: {
        GetDataSoap: {
          GetDataBySecure: (_: any, callback: any) =>
            callback(creditSafeError, creditSafeReply),
        },
      },
    }
    jest.resetAllMocks()
    ;(createClientAsync as jest.Mock).mockResolvedValue(creditSafe)
  })

  describe('#getInformation', () => {
    test('it calls with formated personal numbers', () => {
      getInformation(['19121212-1212', '1212121212'])
      expect(createClientAsync).toHaveBeenCalledTimes(2)
    })

    test('it includes an exception for Avliden person', async () => {
      creditSafeReply = {
        GetDataBySecureResult: {
          Error: {
            Cause_of_Reject: 'S4',
            Reject_text: 'Avliden',
          },
        },
      }
      const [{ pnr, exception }] = await getInformation(pnrs)
      expect(pnr).toBe(pnrs[0])
      expect(exception).toBe('Avliden')
    })
    test('it includes an exception Utvandrad person', async () => {
      creditSafeReply = {
        GetDataBySecureResult: {
          Error: {
            Cause_of_Reject: 'S6',
            Reject_text: 'Utvandrad',
          },
        },
      }
      const [{ pnr, exception }] = await getInformation(pnrs)
      expect(pnr).toBe(pnrs[0])
      expect(exception).toBe('Utvandrad')
    })
    test('it includes an exception Skyddad personuppgift person', async () => {
      creditSafeReply = {
        GetDataBySecureResult: {
          Error: {
            Cause_of_Reject: 'S2',
            Reject_text: 'Skyddad',
          },
        },
      }
      const [{ pnr, exception }] = await getInformation(pnrs)
      expect(pnr).toBe(pnrs[0])
      expect(exception).toBe('Skyddad')
    })
    test('it includes an exception whatever the Error reject text was', async () => {
      creditSafeReply = {
        GetDataBySecureResult: {
          Error: {
            Reject_text: 'It b0rked',
          },
        },
      }
      const [{ pnr, exception }] = await getInformation(pnrs)
      expect(pnr).toBe(pnrs[0])
      expect(exception).toBe('It b0rked')
    })
  })
})
