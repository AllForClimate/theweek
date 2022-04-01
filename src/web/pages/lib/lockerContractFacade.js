import lockerAbi from '../locker-abi.json'
import { ethers } from 'ethers'

const lockerContractAddress = process.env.NEXT_PUBLIC_LOCKER_CONTRACT_ADDRESS

export async function isFacilitator(signer) {
    const facilitators = await getFacilitators(signer)
    const signerAddress = await signer.getAddress()
    return facilitators.includes(signerAddress)
}

export async function getFacilitators(signer) {
    const contract = new ethers.Contract(lockerContractAddress, lockerAbi, signer)
    return await contract.getFacilitatorAddresses()
}

export async function grantFacilitatorRole(signer, address) {
    const contract = new ethers.Contract(lockerContractAddress, lockerAbi, signer)
    const roleId = await contract.FACILITATOR_ROLE()
    await contract.grantRole(roleId, address)
}