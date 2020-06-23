//@ts-ignore
import personnummer from 'personnummer'

/**
 * Formats personnummer to yymmddxxx, the format used by Syna.
 * @param pnrs an array of valid personnummer
 */
export const toSynaFormat = (pnr: string): string => {
  try {
    return personnummer.parse(pnr).format().replace('-', '').replace('+', '')
  } catch (error) {
    console.log('Error parsing', pnr, error)
    throw error
  }
}

export const valid = personnummer.valid
