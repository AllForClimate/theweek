// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract Locker is AccessControl {
  EnumerableSet.AddressSet private facilitators;

  constructor(address admin) {
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
  }

  bytes32 public constant FACILITATOR_ROLE = keccak256("FACILITATOR_ROLE");

  function getFacilitatorAddresses() public view returns(address[] memory) {
    return EnumerableSet.values(facilitators);
  }

  function _grantRole(bytes32 role, address account) internal override {
    super._grantRole(role, account);
    if(role == FACILITATOR_ROLE && !EnumerableSet.contains(facilitators, account)) {
      EnumerableSet.add(facilitators, account);
    }
  }

  function _revokeRole(bytes32 role, address account) internal override {
    super._revokeRole(role, account);
    if(role == FACILITATOR_ROLE) {
        EnumerableSet.remove(facilitators,account);
    }
  }
}
