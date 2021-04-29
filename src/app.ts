import express, { Application, Response } from 'express'
import timeout from 'connect-timeout'
import cors from 'cors'
import {
  getSelection,
  getAllSelections,
  deleteSelection,
  exportSelection,
  syncPopulationRegistration,
  createSelection,
  getContracts,
  fetchAndSyncSelection,
} from '@app/routes/selection'
import { updateContract, getContract } from '@app/routes/contracts'
import errorHandler from '@app/middleware/errorHandler'
import { createValidator } from 'express-joi-validation'
import {
  getSelectionSchema,
  updateContractSchema,
  deleteSelectionSchema,
  createSelectionSchema,
  getContractSchema,
} from '@app/validation/validationSchemas'
import { routes as authRoutes } from '@app/routes/auth'
import { authMiddleware } from './middleware/auth'

const validator = createValidator()
const app: Application = express()

app.use(express.json())
app.use(
  express.urlencoded({
    extended: true,
  })
)
app.use(cors())

app.get('/', (_req, res: Response) =>
  res.send({ name: 'sublet-detector', version: '1.0.0' })
)

app.get('/selection', authMiddleware, getAllSelections, errorHandler)
app.post(
  '/selection',
  authMiddleware,
  validator.body(createSelectionSchema),
  createSelection,
  errorHandler
)
app.get(
  '/selection/:id',
  authMiddleware,
  validator.params(getSelectionSchema),
  getSelection,
  errorHandler
)
app.get(
  '/selection/:id/sync-population-registration',
  authMiddleware,
  syncPopulationRegistration,
  errorHandler
)
app.delete(
  '/selection/:id',
  authMiddleware,
  validator.params(deleteSelectionSchema),
  deleteSelection,
  errorHandler
)
app.get('/selection/:id/export', authMiddleware, exportSelection, errorHandler)
app.get(
  '/selection/:id/fetch-contracts',
  authMiddleware,
  validator.params(getSelectionSchema),
  fetchAndSyncSelection,
  errorHandler
)
app.get(
  '/selection/:id/contracts',
  authMiddleware,
  validator.params(getSelectionSchema),
  getContracts,
  errorHandler
)
app.get(
  '/contract/:id',
  authMiddleware,
  validator.params(getContractSchema),
  getContract,
  errorHandler
)
app.put(
  '/contract/:id',
  authMiddleware,
  validator.body(updateContractSchema),
  updateContract,
  errorHandler
)

authRoutes(app)

app.use(timeout('300s'))

export default app
