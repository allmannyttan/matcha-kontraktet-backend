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

const request = agent(app)
const selectionIds: any[] = []

jest.mock('@app/helpers/personnummer', () => ({
  valid: () => true,
  format: (args: any) => args,
}))

describe('#app()', () => {
  let token: string
  let selectionTerm: string
  beforeAll(async () => {
    selectionTerm = 'bar'

    nock(config.api.baseUrl, { allowUnmocked: true })
      .persist()
      .get(
        `/leasecontracts/?includetenants=true&includerentals=true&rentalid=${selectionTerm}*`
      )
      .reply(200, fastApiData)

    nock('https://apitest.syna.se:443', { encodedQueryParams: true })
      .persist()
      .post('/')
      .reply(200, synaReply)

    const { body } = await request.post('/auth/generate-token').send({
      username: 'test',
      password: 'kalas',
    })

    token = body.token
  })

  afterAll(async () => {
    const contracts = await db
      .select('contract_id')
      .from('selection_contracts')
      .whereIn('selection_id', selectionIds)

    const contractIds = contracts.map(({ contract_id }) => contract_id)

    await db
      .select('*')
      .from('selection_contracts')
      .whereIn('selection_id', selectionIds)
      .del()

    await db
      .select('*')
      .from('population_registration_syncs')
      .whereIn('selection_id', selectionIds)
      .del()
    await db.select('*').from('selections').whereIn('id', selectionIds).del()

    await db.select('*').from('contracts').whereIn('id', contractIds).del()
  })

  test('contract status should keep state when a new selection fetches same contract', async () => {
    // Create first selection
    const {
      body: {
        data: { id: firstSelectionId },
      },
    } = await request
      .post('/selection')
      .auth(token, { type: 'bearer' })
      .send({ name: 'foo', selection_term: selectionTerm })
      .expect(200)

    selectionIds.push(firstSelectionId)

    // Fetch and sync contracts for selection
    await request
      .get(`/selection/${firstSelectionId}/fetch-contracts`)
      .auth(token, { type: 'bearer' })
      .expect(200)

    // Get contracts for selection
    const {
      body: {
        data: [{ id: contractId }],
      },
    } = await request
      .get(`/selection/${firstSelectionId}/contracts`)
      .auth(token, { type: 'bearer' })
      .expect(200)

    // Update contract to Verified
    const {
      body: { data: updatedContract },
    } = await request
      .put(`/contract/${contractId}/`)
      .auth(token, { type: 'bearer' })
      .send({ status: 'VERIFIED' })
      .expect(200)

    expect(updatedContract.status).toBe('VERIFIED')

    // Create a second selection
    const {
      body: {
        data: { id: secondSelectionId },
      },
    } = await request
      .post('/selection')
      .auth(token, { type: 'bearer' })
      .send({ name: 'foo', selection_term: selectionTerm })
      .expect(200)

    selectionIds.push(secondSelectionId)

    // Fetch and sync contracts for selection
    await request
      .get(`/selection/${secondSelectionId}/fetch-contracts`)
      .auth(token, { type: 'bearer' })
      .expect(200)

    // Get contracts for first selection
    const {
      body: {
        data: [{ status: firstSelectionContractStatus }],
      },
    } = await request
      .get(`/selection/${firstSelectionId}/contracts`)
      .auth(token, { type: 'bearer' })
      .expect(200)

    // Get contracts for second selection
    const {
      body: {
        data: [{ status: secondSelectionContractStatus }],
      },
    } = await request
      .get(`/selection/${secondSelectionId}/contracts`)
      .auth(token, { type: 'bearer' })
      .expect(200)

    expect(firstSelectionContractStatus).toBe('VERIFIED')

    expect(firstSelectionContractStatus).toEqual(secondSelectionContractStatus)
  }, 15000)

  test('contract with multiple partners syncs all of them', async () => {
    // Create first selection
    const {
      body: {
        data: { id: selectionId },
      },
    } = await request
      .post('/selection')
      .auth(token, { type: 'bearer' })
      .send({ name: 'foo', selection_term: selectionTerm })
      .expect(200)

    selectionIds.push(selectionId)

    // Fetch and sync contracts for selection
    await request
      .get(`/selection/${selectionId}/fetch-contracts`)
      .auth(token, { type: 'bearer' })
      .expect(200)

    // Get contracts for selection
    const {
      body: { data: contracts },
    } = await request
      .get(`/selection/${selectionId}/contracts`)
      .auth(token, { type: 'bearer' })
      .expect(200)

    expect(contracts).toHaveLength(1)

    const contractWithMultiplePartners = contracts[0]
    const {
      contract_information,
      population_registration_information,
    } = contractWithMultiplePartners

    expect(contract_information).toHaveLength(2)
    expect(population_registration_information).toHaveLength(2)

    expect(contract_information[0].pnr).not.toEqual(contract_information[1].pnr)
    expect(population_registration_information[0].pnr).not.toEqual(
      population_registration_information[1].pnr
    )
  }, 15000)
})
