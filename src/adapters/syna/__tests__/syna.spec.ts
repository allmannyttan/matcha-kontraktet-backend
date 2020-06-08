import { synaXML } from '../syna'
import axios from 'axios'

jest.mock('axios')

describe('#synaXML', () => {
  test('it creates valid xml for ONE person', () => {
    const xml = synaXML(
      ['a pnr'],
      'username',
      '1234',
      'calling.from.this.address'
    )
    expect(xml).toMatchInlineSnapshot(`
      "
        <?xml version=\\"1.0\\" encoding=\\"iso-8859-1\\" ?>
        <Fraga>
          <Produkt id=\\"BFbokf\\" ver=\\"1.4\\">
            <Objektlista antal=\\"1\\">
              <Objekt><Idnr>a pnr</Idnr></Objekt>
            </Objektlista>
          </Produkt>
          <Process timestamp=\\"\\" timeout=\\"\\" />
          <Kund nr=\\"1234\\" anv=\\"username\\" ipaddress=\\"calling.from.this.address\\" />
        </Fraga>"
    `)
  })

  test('it creates valid xml for MULTIPLE persons', () => {
    const xml = synaXML(
      ['a pnr', 'another pnr'],
      'username',
      '1234',
      'calling.from.this.address'
    )
    expect(xml).toMatchInlineSnapshot(`
      "
        <?xml version=\\"1.0\\" encoding=\\"iso-8859-1\\" ?>
        <Fraga>
          <Produkt id=\\"BFbokf\\" ver=\\"1.4\\">
            <Objektlista antal=\\"2\\">
              <Objekt><Idnr>a pnr</Idnr></Objekt><Objekt><Idnr>another pnr</Idnr></Objekt>
            </Objektlista>
          </Produkt>
          <Process timestamp=\\"\\" timeout=\\"\\" />
          <Kund nr=\\"1234\\" anv=\\"username\\" ipaddress=\\"calling.from.this.address\\" />
        </Fraga>"
    `)
  })
})
