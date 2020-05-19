import { Request, Response } from 'express'
import { db } from '../adapters/psotgres'

export const getSelections = async (_req: Request, res: Response) => {
  const selections = await db.select('*').from('selections')

  const selectionWithContracts = selections.map((selection) => {
    selection.contracts = []

    return selection
  })

  return res.send({ data: selectionWithContracts })
}
