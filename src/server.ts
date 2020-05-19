import express, { Application, Response } from 'express'
import config from '@app/config'
import { getSelections } from './routes/selection'

const app: Application = express()

app.get('/', (_req, res: Response) =>
  res.send({ name: 'sublet-detector', version: '1.0.0' })
)

app.get('/selection', getSelections)
app.get('/selection/:id', (_req, res: Response) => res.send({ data: [] }))
app.delete('/selection/:id', (_req, res: Response) => res.send({ data: [] }))
app.get('/selection/:id/export', (_req, res: Response) =>
  res.send({ data: [] })
)

app.post('/contract', (_req, res: Response) => res.send({ data: [] }))

app.post('/auth', (_req, res: Response) => res.send({ token: '' }))

app.listen({ port: config.port }, () =>
  console.log(`🚀 Server ready at http://localhost:${config.port}`)
)
