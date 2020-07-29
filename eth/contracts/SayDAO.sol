// # SayDAO contract
//
// SayDAO is an invite only DAO.

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";
import "./IMembership.sol";

contract SayDAO is BaseRelayRecipient, AccessControl {
  bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

  uint constant PAGE_SIZE = 32;

  // ## Members
  //
  // Each member is identified by their memberId, that is stored in an array
  // of integers. The memberId is associated to the member's identity.
  uint16[] public members;
  // Each memberId is associated to the member address.
  mapping (uint16 => address) public memberToAddress;
  mapping (address => uint16) public addressToMember;

  constructor(address _forwarder) public {
    trustedForwarder = _forwarder;
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    _setupRole(MANAGER_ROLE, _msgSender());
  }

  function _msgSender() internal view override(BaseRelayRecipient, Context) returns (address payable) {
    return BaseRelayRecipient._msgSender();
  }

  function join(uint16 memberId, uint8 v, bytes32 r, bytes32 s) public {
    require(memberToAddress[memberId] == address(0), "Invite used already");
    // FIXME: only two digits allowed
    bytes32 messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n2", memberId));
    address signer = ecrecover(messageHash, v, r, s);
    require(hasRole(MANAGER_ROLE, signer), "Invite not valid.");
    memberToAddress[memberId] = _msgSender();
    addressToMember[_msgSender()] = memberId;
    members.push(memberId);
  }

  function listMembers(uint page) view public returns(uint[PAGE_SIZE] memory chunk) {
    uint offset = page * PAGE_SIZE;
    for(uint i = 0; i < PAGE_SIZE && i + offset < members.length; i++) {
      uint16 member = members[i+offset];
      chunk[i] = uint256(memberToAddress[member]) << 96 | uint256(member);
    }
  }

  // ## Poll functions
  //
  // A Poll means a question put to the Members of the Community for a Vote
  // using Say. A Poll can be initiated by any Member of the Community with
  // Say.

  // struct Poll {
  //   uint16[] yes;
  //   uint16[] no;
  // }
  // mapping(bytes => Poll) pollTo

  // function createPoll(bytes cid, uint end) public {
  //   require(end >= 1 days, "A poll must have a time limit of at least one day");

  // }

}
