import axios from 'axios'
import config from '@app/config'
import xml2json from 'xml2json'

export const synaXML = (
  pnrs: string[],
  username: string,
  customerNumber: string,
  callingIpAddress: string
): string => {
  const pnrObjects: string = pnrs
    .map((pnr) => `<Objekt><Idnr>${pnr}</Idnr></Objekt>`)
    .reduce((acc, s) => acc.concat(s), '')

  return `
  <?xml version="1.0" encoding="iso-8859-1" ?>
  <Fraga>
    <Produkt id="BFbokf" ver="1.4">
      <Objektlista antal="${pnrs.length}">
        ${pnrObjects}
      </Objektlista>
    </Produkt>
    <Process timestamp="" timeout="" />
    <Kund nr="${customerNumber}" anv="${username}" ipaddress="${callingIpAddress}" />
  </Fraga>`
}

/**
 * Gets infomation from Syna for an array of personnummer.
 *
 * @param pnrs an array of personnummer on the format yymmddxxxx
 */
export const getSynaInformation = async (
  pnrs: string[]
): Promise<syna.RootObject> => {
  const { host, username, customerNumber, callingIpAddress } = config.syna

  const xmlClient = axios.create({
    baseURL: host,
  })

  const { data } = await xmlClient.post(
    '/',
    synaXML(pnrs, username, customerNumber, callingIpAddress),
    {
      responseType: 'arraybuffer', //To enable decoding using 'latin1'
    }
  )

  const root: syna.RootObject = JSON.parse(
    xml2json.toJson(data.toString('latin1'), {
      alternateTextNode: true,
      arrayNotation: ['Adress', 'Objekt'],
    })
  )

  return root
}
