import { PopulationRegistrationInformation } from '@app/types'
import { getSynaInformation } from './syna'
import config from '@app/config'
import { toSynaFormat } from '@app/helpers/personnummer'

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
      console.error(root.Svar.Error)
      throw new Error('Error in Syna integration: ' + root.Svar.Error.Msg._t)
    }

    fetched += batch.length
  }

  return arrObjekt
}

export const getPopulationRegistrationInformation = async (
  pnrs: string[]
): Promise<PopulationRegistrationInformation[]> => {
  try {
    const formatted = pnrs.map(toSynaFormat)

    const synaInfo = await getSynaBatches(formatted, config.syna.batchSize)

    let result: PopulationRegistrationInformation[] = []

    if (synaInfo) {
      result = toPopulationRegistrationInformationArray(synaInfo)
    }

    return result
  } catch (error) {
    console.error(error)
    return Promise.reject(error)
  }
}

const toPopulationRegistrationInformationArray = (
  objektlista: syna.Omfragad[]
): PopulationRegistrationInformation[] => {
  return objektlista.map((obj) => toPopulationRegistrationInformation(obj))
}

const toPopulationRegistrationInformation = (
  omfragad: syna.Omfragad
): PopulationRegistrationInformation => {
  let adrString = 'Folkbokföringsadress saknas'

  const address = omfragad.Adresslista.Adress.find((a) => a.typ === 'fbf')
  if (address) {
    adrString = address.Gatabox
  }

  const pri: PopulationRegistrationInformation = {
    pnr: omfragad.id,
    name: omfragad.Namnlista.Namn._t,
    address: adrString,
  }

  return pri
}
