import * as Joi from '@hapi/joi'

export const getSelectionSchema = Joi.object({
  id: Joi.string().uuid().required(),
})

export const getContractSchema = Joi.object({
  id: Joi.string().uuid().required(),
})

export const createSelectionSchema = Joi.object({
  selection_term: Joi.string().when('from', {
    is: null,
    then: Joi.when('to', { is: null, then: Joi.required() }),
  }),
  name: Joi.string(),
  from: Joi.date().optional(),
  to: Joi.date().optional(),
})

export const deleteSelectionSchema = Joi.object({
  id: Joi.string().uuid().required(),
})

export const updateContractSchema = Joi.object({
  status: Joi.string()
    .valid(
      ...[
        'VERIFIED',
        'INVALID',
        'VERIFIED_SUBLETTING',
        'MANUALLY_VERIFIED',
        'UNDER_INVESTIGATION',
      ]
    )
    .required(),
  comment: Joi.string().allow('', null),
})
