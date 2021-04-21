import app from './app'
import config from '@app/config'
import logger from '@app/helpers/logger'

app.listen({ port: config.port }, () =>
  logger.info(`🚀 Server ready at http://localhost:${config.port}`)
)
