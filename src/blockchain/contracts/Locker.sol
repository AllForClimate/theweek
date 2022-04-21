// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/security/pausable.sol";

contract Locker is AccessControl, Pausable {
  EnumerableSet.AddressSet private _facilitators;
  uint public amountToLock;
  enum LockedFundStatus {
    pending, 
    toBeRefunded,
    refunded,
    toBeSeized,
    seized
  }
  struct LockedFund {
    LockedFundStatus status;
    uint amount;
  }
  string[] eventIds;

  // maps events to funds locked by individual addresses
  mapping(string => mapping(address => LockedFund)) public events;
  mapping(string => address[]) public eventAddresses;

  constructor(address admin) {
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    amountToLock = 6;
  }

  bytes32 public constant FACILITATOR_ROLE = keccak256("FACILITATOR_ROLE");
  bytes32 public constant FUNDS_CLERK_ROLE = keccak256("FUNDS_CLERK_ROLE");

  function getFacilitatorAddresses() public view returns(address[] memory) {
    return EnumerableSet.values(_facilitators);
  }

  function _grantRole(bytes32 role, address account) internal override whenNotPaused {
    super._grantRole(role, account);
    if(role == FACILITATOR_ROLE && !EnumerableSet.contains(_facilitators, account)) {
      EnumerableSet.add(_facilitators, account);
    }
  }

  function _revokeRole(bytes32 role, address account) internal override whenNotPaused {
    super._revokeRole(role, account);
    if(role == FACILITATOR_ROLE) {
        EnumerableSet.remove(_facilitators,account);
    }
  }

  function lockFunds(string calldata eventId) public payable whenNotPaused {
    require(msg.value == amountToLock, 'Invalid amount');
    // Checks the same address did not already lock funds for the same event
    require(events[eventId][msg.sender].amount == 0, 'Already locked funds for this event');
    if(eventAddresses[eventId].length == 0) {
      eventIds.push(eventId);
    }
    eventAddresses[eventId].push(msg.sender);
    events[eventId][msg.sender] = LockedFund(LockedFundStatus.pending, msg.value);
  }

  function refund(string calldata eventId) public whenNotPaused {
    LockedFund storage lockedFund= events[eventId][msg.sender];
    address payable target = payable(msg.sender);
    require(lockedFund.amount > 0, 'No locked fund found.');
    require(lockedFund.status == LockedFundStatus.toBeRefunded, 'Funds are not marked as refundable');
    lockedFund.status = LockedFundStatus.refunded;
    target.transfer(lockedFund.amount);
  }

  function finalizeDeposit(string calldata eventId, address[] calldata addressesToRefund) public whenNotPaused {
    require(hasRole(DEFAULT_ADMIN_ROLE ,msg.sender) || hasRole(FUNDS_CLERK_ROLE, msg.sender), 'Unauthorized');
    uint numberOfaddressesToSeize = uint(eventAddresses[eventId].length) - uint(addressesToRefund.length);
    address[] memory addressesToSeize = new address[](numberOfaddressesToSeize);

    for (uint i = 0; i < addressesToRefund.length; i++) {
        if(events[eventId][addressesToRefund[i]].status == LockedFundStatus.pending){
          events[eventId][addressesToRefund[i]].status = LockedFundStatus.toBeRefunded;
        }
    }

    //automatically mark all other addresses as seizable
    bool refunded;
    uint currentToSeizeIndex = 0;
    for (uint i = 0; i < eventAddresses[eventId].length; i ++) {
        refunded = false;
        for (uint j = 0; j < addressesToRefund.length; j ++) {
          if(eventAddresses[eventId][i] == addressesToRefund[j]) {
            refunded = true;
          }
        }
        if(!refunded) {
          addressesToSeize[currentToSeizeIndex] = eventAddresses[eventId][i];
          currentToSeizeIndex = currentToSeizeIndex + 1;
        }
    }
    for (uint i = 0; i < addressesToSeize.length; i++) {
        if(events[eventId][addressesToSeize[i]].status == LockedFundStatus.pending){
          events[eventId][addressesToSeize[i]].status = LockedFundStatus.toBeSeized;
        }
    }
  }

  function withdrawSeizedFundsToDAOTreasure() public whenNotPaused {
    require(hasRole(DEFAULT_ADMIN_ROLE ,msg.sender) || hasRole(FUNDS_CLERK_ROLE, msg.sender), 'Unauthorized');

  }

  function pause() public whenNotPaused onlyRole(DEFAULT_ADMIN_ROLE) {
    _pause();
  }

  function unpause() public whenPaused onlyRole(DEFAULT_ADMIN_ROLE) {
    _unpause();
  }
}
