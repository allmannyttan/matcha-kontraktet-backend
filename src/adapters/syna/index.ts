import { PopulationRegistrationInformation } from '@app/types'
import { getSynaInformation } from './syna'
import config from '@app/config'
import { format } from '@app/helpers/personnummer'

export const getSynaBatches = async (
  pnrs: string[],
  batchSize: number
): Promise<syna.Omfragad[]> => {
  let fetched = 0
  let arrObjekt: syna.Omfragad[] = []

  while (true) {
    if (fetched >= pnrs.length) {
      break
    }
    const batch = pnrs.slice(fetched, fetched + batchSize)
    const root = await getSynaInformation(batch)

    if (root.Svar.Objektlista) {
      arrObjekt = arrObjekt.concat(
        root.Svar.Objektlista.Objekt.map((o) => o.Omfragad)
      )
    }

    if (root.Svar.Error) {
      console.error('An error occurred', console.log(root.Svar.Error))
      // Apparently errors can occur with some lookups, while returning the rest correct... Let's not abort
      // the whole batch right now. May need a check on which error has occured.
      // throw new Error('Error in Syna integration: ' + root.Svar.Error.Msg._t)
    }

    fetched += batch.length
  }

  return arrObjekt
}

const findException = (
  omfragad: syna.Omfragad
): PopulationRegistrationInformation['exception'] => {
  let exception = null

  const hasNot = omfragad.not !== ''
  const address = omfragad.Adresslista.Adress.find((a) => a.typ === 'fbf')
  const hasSpecialAddressAbroad = omfragad.Adresslista.Adress.some(
    (a) => a.typ === 'spu'
  )
  const hasSpecialAddress = omfragad.Adresslista.Adress.some(
    (a) => a.typ === 'sps'
  )
  const hasRegistrationMissing = address && address.not !== ''

  if (hasSpecialAddress) {
    exception = 'Särskild postadress svensk'
  }

  if (hasSpecialAddressAbroad) {
    exception = 'Särskild postadress utländsk'
  }

  if (hasRegistrationMissing) {
    exception = 'Folkbokföringsadress saknas'
  }

  if (hasNot) {
    exception = omfragad.not
  }

  return exception
}

const toPopulationRegistrationInformation = (
  omfragad: syna.Omfragad
): PopulationRegistrationInformation => {
  let adrString = 'Folkbokföringsadress saknas'

  const address = omfragad.Adresslista.Adress.find((a) => a.typ === 'fbf')
  if (address) {
    adrString = address.Gatabox
  }

  const exception = findException(omfragad)

  const pri: PopulationRegistrationInformation = {
    pnr: omfragad.id,
    name: omfragad.Namnlista.Namn._t,
    address: adrString,
    exception,
  }

  return pri
}

export const getInformation = async (
  pnrs: string[]
): Promise<PopulationRegistrationInformation[]> => {
  try {
    const formatted = pnrs.map(format)

    const synaInfo = await getSynaBatches(formatted, config.syna.batchSize)

    if (!synaInfo) {
      return []
    }

    return synaInfo.map(toPopulationRegistrationInformation)
  } catch (error) {
    console.error(error)
    return Promise.reject(error)
  }
}
