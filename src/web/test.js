const ethers = require('ethers')
const provider = new ethers.providers.JsonRpcProvider('HTTP://127.0.0.1:7545')
const signer = new ethers.Wallet('b429360dd2a6eb13b524e61b9bbb32b43fa544d793d0cda3e3aa9a4c77acb313', provider)
signer.getBalance().then(balance => console.log(balance))