import * as Joi from '@hapi/joi'

export const getSelectionSchema = Joi.object({
  id: Joi.string().uuid().required(),
})

export const deleteSelectionSchema = Joi.object({
  id: Joi.string().uuid().required(),
})

export const updateContractSchema = Joi.object({
  contractId: Joi.string().uuid().required(),
  status: Joi.string()
    .valid(
      ...['VERIFIED', 'INVALID', 'MANUALLY_VERIFIED', 'UNDER_INVESTIGATION']
    )
    .required(),
  comment: Joi.string().required(),
})
