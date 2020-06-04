import HttpException from '@app/exceptions/HttpException'
import {
  deleteSelectionById,
  getSelectionById,
  getSelections,
  insertSelection,
} from '@app/services/db'
import { syncSelection } from '@app/services/populationInformationSync'
import { NextFunction, Request, Response } from 'express'

export const createSelection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { selection_term, name } = req.body
    const [newSelection] = await insertSelection(
      selection_term,
      name,
      req.auth ? req.auth.username : ''
    )

    return res.send({ data: newSelection })
  } catch (error) {
    console.log(error)
    return next(new HttpException(500, 'Internal Server Error'))
  }
}
export const getAllSelections = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const selections = await getSelections()

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
    const selection = await getSelectionById(id)

    if (!selection) {
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

    await deleteSelectionById(id)

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

export const syncPopulationRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params

  try {
    await syncSelection(id, req.auth ? req.auth.username : '')

    return res.send({
      data: {
        success: true,
      },
    })
  } catch (error) {
    return next(error)
  }
}
