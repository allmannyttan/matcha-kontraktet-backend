import { Request, Response, NextFunction } from 'express'
import { db } from '../adapters/psotgres'

export const getAllSelections = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const selections = await db.select('*').from('selections')

    return res.send({ data: selections })
  } catch (error) {
    return next(error)
  }
}

export const getSelection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const selection = await db.select('*').from('selections').where('id', id)

    return res.send({ data: selection })
  } catch (error) {
    return next(error)
  }
}

export const deleteSelection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    await db.select('*').from('selections').where('id', id).del()

    return res.send({
      data: {
        selectionId: id,
      },
    })
  } catch (error) {
    return next(error)
  }
}
