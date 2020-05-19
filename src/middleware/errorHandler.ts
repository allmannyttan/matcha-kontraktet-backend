import { NextFunction, Request, Response } from 'express'
import HttpException from '@app/exceptions/HttpException'

const errorHandler = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = error.status || 500
  const message = error.message || 'Something went wrong'
  res.status(status).send({
    status,
    message,
  })
}

export default errorHandler
