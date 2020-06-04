import { toSynaFormat } from '../personnummer'

describe('#toSynaFormat', () => {
  test('formats an array of pnrs to format yymmddxxxx', () => {
    const result = [
      '191212121212',
      '1212121212',
      '19121212-1212',
      '121212-1212',
      '19121212+1212',
      '121212+1212',
    ].map(toSynaFormat)

    expect(result).toEqual([
      '1212121212',
      '1212121212',
      '1212121212',
      '1212121212',
      '1212121212',
      '1212121212',
    ])
  })
})
