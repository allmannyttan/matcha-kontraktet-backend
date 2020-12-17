import { format } from '../personnummer'

describe('#toSynaFormat', () => {
  test('formats an array of pnrs to format yymmddxxxx', () => {
    const result = [
      '191212121212',
      '1212121212',
      '19121212-1212',
      '121212-1212',
      '19121212+1212',
      '121212+1212',
    ].map(format)

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
