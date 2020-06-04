import personnummer from 'personnummer'

/**
 * Formats personnummer to yymmddxxx, the format used by Syna.
 * @param pnrs an array of valid personnummer
 */
export const toSynaFormat = (pnr: string): string => {
  return personnummer.parse(pnr).format().replace('-', '').replace('+', '')
}

export const valid = personnummer.valid
