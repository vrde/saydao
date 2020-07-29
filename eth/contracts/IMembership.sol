pragma solidity ^0.6.0;

interface IMembership {
  function addressOf(uint16 member) external view returns(address);
}
