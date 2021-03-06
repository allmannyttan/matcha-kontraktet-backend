import {
  ContractInformation,
  PopulationRegistrationInformation,
  ContractStatus,
} from '@app/types'

export const getAutomatedStatus = (
  contract: ContractInformation[],
  pri: PopulationRegistrationInformation[]
): ContractStatus => {
  return pri.every((p) => areAddressesEqual(contract[0], p))
    ? ContractStatus.VERIFIED
    : ContractStatus.INVALID
}

export const isStatusOverrideable = (status: ContractStatus): boolean => {
  const writeprotected = [
    ContractStatus.MANUALLY_VERIFIED,
    ContractStatus.UNDER_INVESTIGATION,
  ]
  return !writeprotected.includes(status)
}

export const areAddressesEqual = (
  contract: ContractInformation,
  pri: PopulationRegistrationInformation
): boolean => {
  //Normalize addresses for comparison
  let contractAddress = normalize(contract.address)
  let priAddress = pri.address ? normalize(pri.address) : pri.address

  return contractAddress === priAddress
}

const normalize = (address: string): string => {
  let adr = address.toLowerCase()

  if (adr) {
    adr = adr.replace(/lgh \d+/, '')
    adr = adr.replace(/\d+tr$/, '')
    adr = adr.replace(/\sbv$/, '')
    adr = adr.replace(/\s/, '')
    adr = adr.replace(/é/, 'e')
    adr = adr.trim()
  }

  return adr
}
