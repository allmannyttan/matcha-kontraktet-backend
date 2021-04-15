import { getSynaBatches, getInformation } from '../index'
import { getSynaInformation } from '../syna'
import * as synRaplies from './synaReplies.json'

jest.mock('../syna')

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
  test('it works for real person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synRaplies['Real Person']
    )
    const result = await getInformation(['8507099805'])
    expect(result).toEqual([
      {
        address: 'Sveavägen 12',
        name: 'LastName, FirstName',
        pnr: '8507099805',
      },
    ])
  })
  test('it works for Avliden person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(synRaplies['Avliden'])
    const result = await getInformation(['8507099805'])
    expect(result).toEqual([
      {
        address: 'Sveavägen 12',
        name: 'LastName, FirstName',
        pnr: '8507099805',
      },
    ])
  })
  test('it works for Särskild postadress utländsk person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synRaplies['Särskild postadress utländsk']
    )
    const result = await getInformation(['8507099805'])
    expect(result).toEqual([
      {
        address: 'Sveavägen 12',
        name: 'LastName, FirstName',
        pnr: '8507099805',
      },
    ])
  })
  test('it works for Folkbokföringsadress saknas person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synRaplies['Folkbokföringsadress saknas']
    )
    const result = await getInformation(['8507099805'])
    expect(result).toEqual([
      {
        address: 'Sveavägen 12',
        name: 'LastName, FirstName',
        pnr: '8507099805',
      },
    ])
  })
  test('it works for Utvandrad person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synRaplies['Utvandrad']
    )
    const result = await getInformation(['8507099805'])
    expect(result).toEqual([
      {
        address: 'Sveavägen 12',
        name: 'LastName, FirstName',
        pnr: '8507099805',
      },
    ])
  })
  test('it works for Skyddad personuppgift person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synRaplies['Skyddad personuppgift']
    )
    const result = await getInformation(['8507099805'])
    expect(result).toEqual([
      {
        address: 'Sveavägen 12',
        name: 'LastName, FirstName',
        pnr: '8507099805',
      },
    ])
  })
  test('it works for Personnummerbyte (nytt nummer) person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synRaplies['Personnummerbyte (nytt nummer)']
    )
    const result = await getInformation(['8507099805'])
    expect(result).toEqual([
      {
        address: 'Sveavägen 12',
        name: 'LastName, FirstName',
        pnr: '8507099805',
      },
    ])
  })
  test('it works for Personnummerbyte(gammalt nummer) person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synRaplies['Personnummerbyte(gammalt nummer)']
    )
    const result = await getInformation(['8507099805'])
    expect(result).toEqual([
      {
        address: 'Sveavägen 12',
        name: 'LastName, FirstName',
        pnr: '8507099805',
      },
    ])
  })
  test('it works for Särskild postadress svensk person', async () => {
    ;(getSynaInformation as jest.Mock).mockResolvedValue(
      synRaplies['Särskild postadress svensk']
    )
    const result = await getInformation(['8507099805'])
    expect(result).toEqual([
      {
        address: 'Sveavägen 12',
        name: 'LastName, FirstName',
        pnr: '8507099805',
      },
    ])
  })
})
