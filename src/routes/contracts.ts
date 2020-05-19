import { Request, Response, NextFunction } from 'express'

export const updateContract = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.send({ data: {} })
}
