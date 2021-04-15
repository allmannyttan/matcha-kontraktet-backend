import { getSynaBatches, getInformation } from '../index'
import { getSynaInformation } from '../syna'
import * as synaReplies from './synaReplies.json'

jest.mock('../syna')
jest.mock('@app/helpers/personnummer', () => ({
  format: (args: any) => args,
}))

const empty = {
  kod: '',
  _t: '',
}

const Omfragad: syna.Omfragad = {
  id: 'personnummer',
  not: '',
  fbfdatum: '',
  sekel: '',
  Namnlista: {
    Efternamn: '',
    Fornamn: '',
    Mellannamn: '',
    Namn: {
      tilltal: '',
      _t: '',
    },
  },
  Adresslista: {
    Adress: [
      {
        typ: 'fbf',
        not: '',
        Coadress: '',
        Distrikt: empty,
        Forsamling: empty,
        Fortsadress: '',
        Gatabox: 'testadress',
        Kommun: empty,
        Lan: empty,
        Land: empty,
        Landsdel: empty,
        Landskap: empty,
        Postnr: '',
        Postort: '',
      },
    ],
  },
}

const generateSynaResponse = (numberOfPersons: number): syna.RootObject => {
  const omfragade: syna.Objekt[] = Array(numberOfPersons).fill({ Omfragad })

  const root: syna.RootObject = {
    Svar: {
      Objektlista: {
        antal: omfragade.length,
        Objekt: omfragade,
      },
    },
  }
  return root
}

describe('#getSynaBatches', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('it gets one batch when the number of pnrs are less than batch size', async () => {
    const root = generateSynaResponse(1)
    ;(getSynaInformation as jest.Mock).mockResolvedValue(root)

    const result = await getSynaBatches(['pnr'], 10)
    expect(result).toEqual([Omfragad])
    expect(getSynaInformation).toHaveBeenCalledTimes(1)
    expect(getSynaInformation).toHaveBeenCalledWith(['pnr'])
  })

  test('it gets multiple batches when the number of pnrs are bigger than batch size', async () => {
    const root = generateSynaResponse(2)
    ;(getSynaInformation as jest.Mock).mockResolvedValue(root)

    const pnrs = Array(10).fill('pnr')
    const result = await getSynaBatches(pnrs, 2)

    expect(result).toEqual(Array(10).fill(Omfragad))
    expect(getSynaInformation).toHaveBeenCalledTimes(5)
  })

  test('it gets correct number of batches when not devidable', async () => {
    const rootLastCall = generateSynaResponse(1)
    const root2 = generateSynaResponse(2)
    ;(getSynaInformation as jest.Mock)
      .mockResolvedValueOnce(root2)
      .mockResolvedValueOnce(root2)
      .mockResolvedValueOnce(rootLastCall)

    const pnrs = Array(5).fill('pnr')
    const result = await getSynaBatches(pnrs, 2)

    expect(result).toEqual(Array(5).fill(Omfragad))
    expect(getSynaInformation).toHaveBeenCalledTimes(3)
  })
})

describe('#getInformation()', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  test('it has no exception for functioning person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synaReplies['Real Person']
    )
    const [{ exception }] = await getInformation(['8507099805'])
    expect(exception).toBeNull()
  })
  test('it includes an exception for Avliden person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(synaReplies['Avliden'])
    const [{ exception }] = await getInformation(['8507099805'])
    expect(exception).toBe('Personen är avliden 2017-04-12')
  })
  test('it includes an exception Särskild postadress utländsk person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synaReplies['Särskild postadress utländsk']
    )
    const [{ exception }] = await getInformation(['8507099805'])
    expect(exception).toBe('Särskild postadress utländsk')
  })
  test('it includes an exception Folkbokföringsadress saknas person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synaReplies['Folkbokföringsadress saknas']
    )
    const [{ exception }] = await getInformation(['8507099805'])
    expect(exception).toBe('Folkbokföringsadress saknas')
  })
  test('it includes an exception Utvandrad person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synaReplies['Utvandrad']
    )
    const [{ exception }] = await getInformation(['8507099805'])
    expect(exception).toBe('Utvandrad eller avregistrerad av annat skäl')
  })
  test('it includes an exception Skyddad personuppgift person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synaReplies['Skyddad personuppgift']
    )
    const [{ exception }] = await getInformation(['8507099805'])
    expect(exception).toBe('Personen har skyddade personuppgifter')
  })
  test('it includes an exception Personnummerbyte (nytt nummer) person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synaReplies['Personnummerbyte (nytt nummer)']
    )
    const [{ exception }] = await getInformation(['8507099805'])
    expect(exception).toBe('Personnummerbyte. Gammalt nummer: 920230-2320')
  })
  test('it includes an exception Personnummerbyte(gammalt nummer) person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synaReplies['Personnummerbyte(gammalt nummer)']
    )
    const [{ exception }] = await getInformation(['8507099805'])
    expect(exception).toBe('Personnummerbyte. Gammalt nummer: 920230-2320')
  })
  test('it includes an exception Särskild postadress svensk person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synaReplies['Särskild postadress svensk']
    )
    const [{ exception }] = await getInformation(['8507099805'])
    expect(exception).toBe('Särskild postadress svensk')
  })
})
