const Locker = artifacts.require('Locker');

const amountToLock = web3.utils.toWei('6', 'ether')

contract('Locker', accounts => {
    it('should not add an account to the facilitator role if unauthorized', async () => {
        let locker = await Locker.deployed()
        let facilitatorRole = await locker.FACILITATOR_ROLE.call()
        try {
            await locker.grantRole(facilitatorRole, accounts[1], { from : accounts[1]})
            assert.fail('Should not grant role if unauthorized.')
        } catch(e) {
            assert.isTrue(e.message.includes('missing role'))
        }
    })   
    it('should not revoke a role if unauthorized', async () => {
        let locker = await Locker.deployed()
        let facilitatorRole = await locker.FACILITATOR_ROLE.call()
        try {
            await locker.revokeRole(facilitatorRole, accounts[1], { from : accounts[1]})
            assert.fail('Should not revoke role if unauthorized.')
        } catch(e) {
            assert.isTrue(e.message.includes('missing role'))
        }
    })   
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
    
    it('should lock exactly 6 Matics', async () =>  {
        const locker = await Locker.deployed()
        const eventId = 'event'
        await locker.lockFunds(eventId, {from: accounts[3], value: web3.utils.toWei('6', 'ether')})
        const lockedFund = await locker.events.call(eventId, accounts[3])
        assert.equal(lockedFund.amount, amountToLock)
        assert.equal(lockedFund.status, Locker.LockedFundStatus.pending)
        assert.equal(await locker.eventAddresses.call(eventId, 0), accounts[3])
        assert.equal(amountToLock, await web3.eth.getBalance(locker.address))
    })
    it('should fail to lock anything else than exactly 6 Matics', async () =>  {
        const locker = await Locker.deployed()
        const eventId = 'event'
        try {
            await locker.lockFunds(eventId, {from: accounts[3], value: 5})
            assert.fail('Should not allow locking that amount of fund')
        } catch(e) {
            assert.isTrue(e.message.includes('Invalid amount'))
        }
    })
    it('should fail locking funds twice for the same event', async () =>  {
        const locker = await Locker.deployed()
        const eventId = 'event'
        try {
            await locker.lockFunds(eventId, {from: accounts[3], value: amountToLock})
            assert.fail('Should not allow locking twice for the same event')
        } catch(e) {
            assert.isTrue(e.message.includes('Already locked'))
        }
    })
    it('should not finalize event if unauthorized', async () =>  {
        let locker = await Locker.deployed()
        //let fundClerkRole = await locker.FUNDS_CLERK_ROLE.call()
        try {
            await locker.finalizeDeposit('event', [], { from : accounts[3]});
            assert.fail('Should not refund if unauthorized.')
        } catch(e) {
            assert.isTrue(e.message.includes('Unauthorized'))
        }
    })
    it('should finalize a given event', async () =>  {
        let locker = await Locker.deployed()
        let fundClerkRole = await locker.FUNDS_CLERK_ROLE.call()
        const eventId = 'event1'
        await locker.lockFunds(eventId, {from: accounts[3], value: amountToLock})
        await locker.lockFunds(eventId, {from: accounts[4], value: amountToLock})
        await locker.lockFunds(eventId, {from: accounts[5], value: amountToLock})
        await locker.grantRole(fundClerkRole, accounts[2])
        await locker.finalizeDeposit(eventId, [accounts[4]], { from : accounts[2]})
        const lockedFund = await locker.events.call(eventId, accounts[4])
        assert.equal(lockedFund.status, Locker.LockedFundStatus.toBeRefunded)
        const lockedFund1 = await locker.events.call(eventId, accounts[3])
        assert.equal(lockedFund1.status, Locker.LockedFundStatus.toBeSeized)
        const lockedFund2 = await locker.events.call(eventId, accounts[5])
        assert.equal(lockedFund2.status, Locker.LockedFundStatus.toBeSeized)
    })
    it('should change the amount of wei to lock', async() => {
        let locker = await Locker.deployed()
        const eventId = 'event'
        await locker.setAmountToLock('4000000000000000000')
        try {
            await locker.lockFunds(eventId, {from: accounts[6], value: amountToLock})
            assert.fail('Should refuse to lock this amount (we should have changed it')
        }
        catch(e){
            assert.isTrue(e.message.includes('Invalid amount'))
        }
        await locker.lockFunds(eventId, {from: accounts[6], value: '4000000000000000000'})
        const lockedFund = await locker.events.call(eventId, accounts[6])
        assert.equal(lockedFund.amount, '4000000000000000000')
        assert.equal(lockedFund.status, Locker.LockedFundStatus.pending)
    })
})