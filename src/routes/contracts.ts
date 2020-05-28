import { Request, Response, NextFunction } from 'express'
import { db } from '@app/adapters/postgres'
import HttpException from '@app/exceptions/HttpException'

export const updateContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const { status, comment } = req.body
    const [contract] = await db('contracts')
      .where('id', id)
      .update({ status, comment })
      .returning('*')
    return res.send({ data: contract })
  } catch (error) {
    return next(new HttpException(500, 'Internal Server Error'))
  }
}
