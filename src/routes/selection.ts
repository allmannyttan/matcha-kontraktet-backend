import { Request, Response, NextFunction } from 'express'
import { db } from '@app/adapters/postgres'
import HttpException from '@app/exceptions/HttpException'

export const getAllSelections = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const selections = await db.select('*').from('selections')

    return res.send({ data: selections })
  } catch (error) {
    return next(new HttpException(500, 'Internal Server Error'))
  }
}

export const getSelection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const selection = await db
      .select('*')
      .from('selections')
      .where('id', id)
      .first()

    if (selection.length === 0) {
      return next(new HttpException(404, 'Selection not found'))
    }

    return res.send({ data: selection })
  } catch (error) {
    return next(new HttpException(500, 'Internal Server Error'))
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
    return next(new HttpException(500, 'Internal Server Error'))
  }
}

export const exportSelection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    return res.send({
      data: {
        selectionId: id,
        export: 'not build yet',
      },
    })
  } catch (error) {
    return next(error)
  }
}
