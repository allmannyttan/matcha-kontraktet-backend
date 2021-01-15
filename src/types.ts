export enum ContractStatus {
  VERIFIED = 'VERIFIED',
  INVALID = 'INVALID',
  VERIFIED_SUBLETTING = 'VERIFIED_SUBLETTING',
  MANUALLY_VERIFIED = 'MANUALLY_VERIFIED',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
}

export interface ContractInformation {
  pnr: string
  name: string
  address: string
}

export interface PopulationRegistrationInformation {
  pnr: string
  name: string
  address: string
}

export interface Contract {
  id: string
  contract_information: ContractInformation
  population_registration_information?: PopulationRegistrationInformation
  status?: ContractStatus
  comment?: string
  last_population_registration_lookup: Date | null
}

export interface Selection {
  id: string
  name: string
  selection_term: string
  from: Date | null
  to: Date | null
  contracts: Contract[]
  last_population_registration_lookup: Date | null
  created_by: string
  created_at: Date
}
