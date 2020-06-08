import { Request, Response, NextFunction } from 'express'
import { db } from '@app/adapters/postgres'
import { client } from '@app/adapters/api'
import HttpException from '@app/exceptions/HttpException'
import { Select } from 'knex'
import { Selection } from '../types'
import { Contract } from '../types'
import {
  deleteSelectionById,
  getSelectionById,
  getSelections,
  insertSelection,
} from '@app/services/db'
import { syncSelection } from '@app/services/populationInformationSync'

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

const updateContractInDb = async (contract: any): Promise<string> => {
  let contractInDb = await db<Contract>('contracts')
    .where('contract_id', contract.id)
    .first()

  if (contractInDb) {
    await db('contracts')
      .update({
        contract_information: {
          name: contract.partners[0].tenant.fullName,
          pnr: contract.partners[0].tenant.socialSecurityNumber,
          address:
            contract.rentalObject &&
            contract.rentalObject.rental &&
            contract.rentalObject.rental.addresses
              ? contract.rentalObject.rental.addresses[0]
              : null,
        },
      })
      .where('id', contractInDb.id)

    return contractInDb.id
  } else {
    const newId: string = await db('contracts')
      .insert({
        contract_information: {
          name: contract.partners[0].tenant.fullName,
          pnr: contract.partners[0].tenant.socialSecurityNumber,
          address:
            contract.rentalObject &&
            contract.rentalObject.rental &&
            contract.rentalObject.rental.addresses
              ? contract.rentalObject.rental.addresses[0]
              : null,
        },
        contract_id: contract.id,
      })
      .returning('id')

    return newId
  }
}

const connectContractToSelection = async (contractDbId: string) => {}

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

export const fetchContracts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const selection = await getSelectionById(id)

    const contracts = await client.get({
      url: `leasecontracts/?rentalid=${selection.selection_term}*&includetenants=true&includerentals=true`,
    })

    for (const contract of contracts) {
      const dbId = updateContractInDb(contract)
      // connectContractToSelection(dbId)
    }

    return res.send({
      data: {
        contractsRetrieved: contracts.length,
      },
    })
  } catch (error) {
    return next(error)
  }
}
