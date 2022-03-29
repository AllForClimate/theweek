var Locker = artifacts.require("Locker");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Locker, accounts[0]);
//   let locker = await Locker.deployed();
//   let facilitatorRole = await locker.FACILITATOR_ROLE.call();
//   locker.grantRole(facilitatorRole, accounts[1]);
};