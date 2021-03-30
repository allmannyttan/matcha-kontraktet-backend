import { Request, Response, NextFunction } from 'express'
import HttpException from '@app/exceptions/HttpException'
import {
  deleteSelectionById,
  getSelectionById,
  getSelections,
  insertSelection,
  getContractsForSelection,
} from '@app/services/db'
import { syncSelection } from '@app/services/populationInformationSync'
import { fetchApiContracts } from '@app/services/fetchApiContracts'
import config from '@app/config'
import logger from '@app/helpers/logger'

export const createSelection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { selection_term, name, from, to } = req.body
    const [newSelection] = await insertSelection(
      selection_term,
      name,
      from,
      to,
      req.auth ? req.auth.username : ''
    )

    return res.send({ data: newSelection })
  } catch (error) {
    logger.error(error)
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
    logger.error(error)
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
    logger.error(error)
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
    logger.error(error)
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
    logger.error(error)
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
    await syncSelection(
      id,
      req.auth ? req.auth.username : '',
      config.onlyInvalid
    )

    return res.send({
      data: {
        success: true,
      },
    })
  } catch (error) {
    logger.error(error)
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

    const numContracts = await fetchApiContracts(id)

    return res.send({
      data: {
        contractsRetrieved: numContracts,
      },
    })
  } catch (error) {
    logger.error(error)
    return next(error)
  }
}

export const getContracts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const contracts = await getContractsForSelection(id)

    return res.send({
      data: contracts,
    })
  } catch (error) {
    logger.error(error)
    return next(error)
  }
}

export const fetchAndSyncSelection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    await fetchApiContracts(id)
    const contracts = await syncSelection(
      id,
      req.auth ? req.auth.username : '',
      config.onlyInvalid
    )

    return res.send({
      data: {
        success: true,
      },
    })
  } catch (error) {
    logger.error(error)
    return next(error)
  }
}
