import { NextFunction, Request, Response } from 'express'
import HttpException from '@app/exceptions/HttpException'
import logger from '@app/helpers/logger'

const errorHandler = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = error.status || 500
  const message = error.message || 'Something went wrong'

  logger.error(message, status, req.url.toString())

  res.status(status).send({
    status,
    message,
  })
}

export default errorHandler
