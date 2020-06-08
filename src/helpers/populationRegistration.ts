import {
  ContractInformation,
  PopulationRegistrationInformation,
  ContractStatus,
} from '@app/types'

export const getAutomatedStatus = (
  contract: ContractInformation,
  pri: PopulationRegistrationInformation
): ContractStatus => {
  return areAddressesEqual(contract, pri)
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

const areAddressesEqual = (
  contract: ContractInformation,
  pri: PopulationRegistrationInformation
): boolean => {
  //Normalize addresses for comparison according to Vätterhem needs
  let contractAddress = normalize(contract.address)
  let priAddress = normalize(pri.address)

  return contractAddress === priAddress
}

const normalize = (address: string): string => {
  let adr = address
  adr = adr.replace(/lgh \d+/, '')
  adr = adr.replace(/\d+tr$/, '')
  adr = adr.replace(/\sbv$/, '')
  adr = adr.replace(/\s/, '')
  adr = adr.replace(/é/, 'e')
  adr = adr.trim()

  return adr
}
