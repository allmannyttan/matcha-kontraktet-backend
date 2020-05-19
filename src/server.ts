import express, { Application, Response } from 'express'
import config from '@app/config'
import {
  getSelection,
  getAllSelections,
  deleteSelection,
  exportSelection,
} from './routes/selection'

const app: Application = express()

app.get('/', (_req, res: Response) =>
  res.send({ name: 'sublet-detector', version: '1.0.0' })
)

app.get('/selection', getAllSelections)
app.get('/selection/:id', getSelection)
app.delete('/selection/:id', deleteSelection)
app.get('/selection/:id/export', exportSelection)

app.post('/contract', (_req, res: Response) => res.send({ data: [] }))

app.post('/auth', (_req, res: Response) => res.send({ token: '' }))

app.listen({ port: config.port }, () =>
  console.log(`🚀 Server ready at http://localhost:${config.port}`)
)
