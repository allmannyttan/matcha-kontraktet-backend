import express, { Application, Response } from 'express'
import bodyParser from 'body-parser'
import config from '@app/config'
import {
  getSelection,
  getAllSelections,
  deleteSelection,
  exportSelection,
  createSelection,
} from '@app/routes/selection'
import { updateContract } from '@app/routes/contracts'
import errorHandler from '@app/middleware/errorHandler'
import { createValidator } from 'express-joi-validation'
import {
  getSelectionSchema,
  updateContractSchema,
  deleteSelectionSchema,
  createSelectionSchema,
} from '@app/validation/validationSchemas'

const validator = createValidator()
const app: Application = express()

app.use(bodyParser.json())

app.get('/', (_req, res: Response) =>
  res.send({ name: 'sublet-detector', version: '1.0.0' })
)

app.post(
  '/selection',
  validator.body(createSelectionSchema),
  createSelection,
  errorHandler
)
app.get('/selection', getAllSelections, errorHandler)
app.get(
  '/selection/:id',
  validator.params(getSelectionSchema),
  getSelection,
  errorHandler
)
app.delete(
  '/selection/:id',
  validator.params(deleteSelectionSchema),
  deleteSelection,
  errorHandler
)
app.get('/selection/:id/export', exportSelection, errorHandler)

app.post(
  '/contract',
  validator.body(updateContractSchema),
  updateContract,
  errorHandler
)

app.post('/auth', (_req, res: Response) => res.send({ token: '' }))

app.listen({ port: config.port }, () =>
  console.log(`🚀 Server ready at http://localhost:${config.port}`)
)
