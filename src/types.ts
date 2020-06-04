export enum ContractStatus {
  VERIFIED = 'VERIFIED',
  INVALID = 'INVALID',
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
  population_registration_information: PopulationRegistrationInformation
  last_population_registration_lookup: Date | null
  status: ContractStatus
  comment: string
}

export interface Selection {
  id: string
  name: string
  selection_term: string
  contracts: Contract[]
  last_population_registration_lookup: Date | null
  created_by: string
  created_at: Date
}
