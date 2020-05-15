import express, { Response } from 'express'
import config from '@app/config'

const app: express.Application = express()

app.get('/', (_req, res: Response) => {
  res.send({ hello: 'world' })
})

app.listen({ port: config.port }, () =>
  console.log(`🚀 Server ready at http://localhost:${config.port}`)
)
