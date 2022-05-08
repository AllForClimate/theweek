const lockerAbi = require('../pages/locker-abi.json')
const { ethers } = require('ethers')

// const lockerContractAddress = '0x240a5a2f6FDc8528B37D2b07b89a3461844D0Cb1'
// const provider = new ethers.providers.JsonRpcProvider('https://matic-mumbai.chainstacklabs.com')
// const signer = new ethers.Wallet('58d5932479516eda724116f8d310a4d435c25444133fd6e81a5c40775fc869fb', provider)
const lockerContractAddress = '0x73694E80bCf899932254f4266413c6bacc4fb198'
const provider = new ethers.providers.JsonRpcProvider('HTTP://127.0.0.1:7545')
const signer = new ethers.Wallet('ecc680de58b166f377c2088b46123e02725ca051d2b08b17dd53f18032ecc9be', provider)

const contract = new ethers.Contract(lockerContractAddress, lockerAbi, signer)

async function operations () {
    // const current = await contract.amountToLock.call()
    // console.log(current.toString())
    // const tx = await contract.setAmountToLock('1000000000000000', { gasLimit: 30000 })
    // try {
    //     await tx.wait()
    // } catch {
    //     const error = await findFailureInfo(tx.hash)
    //     console.log(error)
    // }
    const updated = await contract.amountToLock.call()
    console.log(updated.toString())
}


async function findFailureInfo(hash) {
    const tx = await provider.getTransaction(hash)
    try {
        await provider.call({ to: tx.to, data: tx.data }, tx.blockNumber)
    } catch (err) {
        console.log(err)
        return ({ message: err.data.message })
    }
    return ({ message: 'Simulated transaction to isolate reason for its failure, but it was actually successful.' })
}

operations().then(()=> console.log('Done'))


//contract.initialize('0xB28865eBC958027941175EF0180cb6ed77283608')