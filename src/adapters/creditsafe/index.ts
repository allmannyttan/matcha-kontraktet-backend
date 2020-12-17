import config from '@app/config'
import { createClientAsync } from 'soap'
import dedent from 'dedent'
import { PopulationRegistrationInformation } from '@app/types'
import { format } from '@app/helpers/personnummer'

const creditsafeXML = (pnr: string) => dedent`
<GetDataBySecure xmlns="https://webservice.creditsafe.se/getdata/">
  <GetData_Request>
    <account>
      <UserName>${config.creditsafe.username}</UserName>
      <Password>${config.creditsafe.password}</Password>
      <Language>SWE</Language>
    </account>
    <FormattedOutput>1</FormattedOutput>
    <Block_Name>${config.creditsafe.basicBlock}</Block_Name>
    <SearchNumber>${pnr}</SearchNumber>
  </GetData_Request>
</GetDataBySecure>
`

const getAddress = async (
  pnr: string
): Promise<PopulationRegistrationInformation> => {
  const client = await createClientAsync(
    `${config.creditsafe.host}${config.creditsafe.getDataPath}`
  )

  return new Promise((resolve, reject) => {
    client.GetData.GetDataSoap.GetDataBySecure(
      {
        _xml: creditsafeXML(pnr),
      },
      (err: any, res: any) => {
        if (err) {
          return reject(err)
        }
        if (res.GetDataBySecureResult.Error) {
          return reject(new Error('Person not found'))
        }

        const data =
          res.GetDataBySecureResult.Parameters.diffgram.NewDataSet
            .GETDATA_RESPONSE
        resolve({
          pnr,
          name: `${data.FIRST_NAME} ${data.LAST_NAME}`,
          address: `${data.ADDRESS}`,
        })
      }
    )
  })
}

export const getInformation = async (
  pnrs: string[]
): Promise<PopulationRegistrationInformation[]> => {
  try {
    const info = await Promise.all(pnrs.map(format).map(getAddress))

    return info || []
  } catch (error) {
    console.error(error)
    return Promise.reject(error)
  }
}
