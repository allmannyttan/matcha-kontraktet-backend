export enum ContractStatus {
  VERIFIED,
  INVALID,
  MANUALLY_VERIFIED,
  UNDER_INVESTIGATION,
}

interface ContractInformation {
  name: string
  address: string
}

interface PopulationRegistrationInformation {
  name: string
  address: string
}

export interface Contract {
  id: string
  contract_information: ContractInformation
  population_registration_informtion: PopulationRegistrationInformation
  status: ContractStatus
  comment: string
}

export interface Selection {
  id: string
  selection_term: string
  contracts: Contract[]
  last_population_registration_lookup: Date
  created_by: string
  created: Date
}
