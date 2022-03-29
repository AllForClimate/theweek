const Locker = artifacts.require('Locker');

contract('Locker', accounts => {
    it('should add an account to the facilitator role', async () => {
        let locker = await Locker.deployed()
        let facilitatorRole = await locker.FACILITATOR_ROLE.call()
        await locker.grantRole(facilitatorRole, accounts[1])
        assert.isTrue(await locker.hasRole(facilitatorRole, accounts[1]))
        let facilitators = await locker.getFacilitatorAddresses()
        assert.equal(facilitators.length, 1)
        assert.equal(accounts[1], facilitators[0])
    })  
    it('should add an account only once to the facilitator role', async () => {
        let locker = await Locker.deployed()
        let facilitatorRole = await locker.FACILITATOR_ROLE.call()
        await locker.grantRole(facilitatorRole, accounts[1])
        await locker.grantRole(facilitatorRole, accounts[1])
        assert.isTrue(await locker.hasRole(facilitatorRole, accounts[1]))
        let facilitators = await locker.getFacilitatorAddresses()
        assert.equal(facilitators.length, 1)
        assert.equal(accounts[1], facilitators[0])
    })  
    it('should add an account to the facilitator role, then remove it', async () => {
        let locker = await Locker.deployed()
        let facilitatorRole = await locker.FACILITATOR_ROLE.call()
        await locker.grantRole(facilitatorRole, accounts[1])
        await locker.revokeRole(facilitatorRole, accounts[1])
        assert.isFalse(await locker.hasRole(facilitatorRole, accounts[1]))
        let facilitators = await locker.getFacilitatorAddresses()
        assert.equal(facilitators.length, 0)
    })
    it('should be pausable', () => {
        assert.fail('Not implemented')
    })
    it('should lock exactly 6 Matics, and keep track of who did lock them', () =>  {
        assert.fail('Not implemented')
    })
    it('should refund a given deposit', () =>  {
        assert.fail('Not implemented')
    })
    it('should not refund a given deposit if the caller is no facilitator', () =>  {
        assert.fail('Not implemented')
    })
})