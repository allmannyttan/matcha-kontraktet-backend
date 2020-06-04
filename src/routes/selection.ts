import { Request, Response, NextFunction } from 'express'
import { db } from '@app/adapters/postgres'
import { client } from '@app/adapters/api'
import HttpException from '@app/exceptions/HttpException'
import { Select } from 'knex'
import { Selection } from '../types'

export const createSelection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { selection_term, name } = req.body
    const [newSelection] = await db('selections').returning('*').insert({
      selection_term,
      name,
      created_by: 'a logged on user to be written using auth in another branch',
    })

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

    console.log('selection', id)

    const selection = await getSelectionFromDb(id)

    if (!selection) {
      return next(new HttpException(404, 'Selection not found'))
    }

    return res.send({ data: selection })
  } catch (error) {
    return next(new HttpException(500, 'Internal Server Error'))
  }
}

const getSelectionFromDb = async (id: string): Promise<Selection> => {
  const selection = await db
    .select('*')
    .from('selections')
    .where('id', id)
    .first()

  return selection
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

export const fetchContracts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const selection = await getSelectionFromDb(id)

    const contracts = await client.get({
      url: `leasecontracts/?rentalid=${selection.selection_term}*&includetenants=true&includerentals=true`,
    })

    return res.send({
      data: {
        contracts: contracts,
      },
    })
  } catch (error) {
    return next(error)
  }
}
