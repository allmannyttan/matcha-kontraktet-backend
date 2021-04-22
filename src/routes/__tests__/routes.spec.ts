/**
 * 
1. create selection
2. fetch contracts for selection
3. get contract
4. update contract
5. get contract
6. create selection
7. fetch contracts for selection
8. get contract

expect(contract from 3 . status === "verifierad" && contract from 8 .status === default value)
 */

// import { fetchAndSyncSelection } from '../selection'
// import { fetchApiContracts } from '@app/services/fetchApiContracts'
// import { syncSelection } from '@app/services/populationInformationSync'

// jest.mock('@app/services/fetchApiContracts')
// jest.mock('@app/services/populationInformationSync')
// jest.mock('@app/config', () => ({
//   postgres: {},
//   onlyInvalid: true,
// }))

import app from '@app/app'
import { agent } from 'supertest'
import nock from 'nock'
import config from '@app/config'
import fastApiData from './fastApiData.json'
import { db } from '@app/adapters/postgres'

import { readFileSync } from 'fs'

const synaReply = readFileSync(
  './src/routes/__tests__/synaReply.xml'
).toString()

// nock.recorder.rec()
const request = agent(app)

describe('#app()', () => {
  let token: string
  let selectionTerm: string
  beforeAll(async () => {
    selectionTerm = 'bar'

    nock(config.api.baseUrl)
      .get(
        `/leasecontracts/?includetenants=true&includerentals=true&rentalid=${selectionTerm}*`
      )
      .reply(200, fastApiData)

    nock('https://apitest.syna.se:443', { encodedQueryParams: true })
      .post('/')
      .reply(200, synaReply)

    await db.raw('truncate table selections cascade')
    await db.raw('truncate table contracts cascade')

    const { body } = await request.post('/auth/generate-token').send({
      username: 'test',
      password: 'kalas',
    })

    token = body.token
  })
  test('it works', async () => {
    const {
      body: {
        data: { id: selectionId },
      },
    } = await request
      .post('/selection')
      .auth(token, { type: 'bearer' })
      .send({ name: 'foo', selection_term: selectionTerm })

    await request
      .get(`/selection/${selectionId}/fetch-contracts`)
      .auth(token, { type: 'bearer' })
      .expect(200)
  }, 15000)
})
