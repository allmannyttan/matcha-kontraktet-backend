import * as Joi from '@hapi/joi'

export const getSelectionSchema = Joi.object({
  id: Joi.string().uuid().required(),
})

export const getContractSchema = Joi.object({
  id: Joi.string().uuid().required(),
})

export const createSelectionSchema = Joi.object({
  selection_term: Joi.string().required(),
  name: Joi.string(),
})

export const deleteSelectionSchema = Joi.object({
  id: Joi.string().uuid().required(),
})

export const updateContractSchema = Joi.object({
  status: Joi.string()
    .valid(
      ...['VERIFIED', 'INVALID', 'MANUALLY_VERIFIED', 'UNDER_INVESTIGATION']
    )
    .required(),
  comment: Joi.string().allow('', null),
})
