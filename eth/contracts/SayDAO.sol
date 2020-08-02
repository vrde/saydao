// # SayDAO contract
//
// SayDAO is an invite only DAO.

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";
import "./SayToken.sol";

contract SayDAO is BaseRelayRecipient, AccessControl {

  bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
  uint public constant PAGE_SIZE = 32;
  uint public constant NULL = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

  address public tokenAddress;

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
    bytes32 messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n2", memberId));
    address signer = ecrecover(messageHash, v, r, s);
    require(hasRole(MANAGER_ROLE, signer), "Invite not valid.");
    memberToAddress[memberId] = _msgSender();
    addressToMember[_msgSender()] = memberId;
    members.push(memberId);
    SayToken token = SayToken(tokenAddress);
    token.mint(memberId, 100e18);
  }

  function listMembers(uint page) view public returns(uint[PAGE_SIZE] memory chunk) {
    uint offset = page * PAGE_SIZE;
    for(uint i = 0; i < PAGE_SIZE && i + offset < members.length; i++) {
      uint16 member = members[i+offset];
      chunk[i] = uint256(memberToAddress[member]) << 96 | uint256(member);
    }
  }

  function totalMembers() view public returns (uint) {
    return members.length;
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

  struct Poll {
    // IPFS Content ID without the first two bytes.
    uint cid;
    // When does the poll ends, UNIX timestamp.
    uint end;
    // Total amount of token supply at the time.
    // This is redundand and can be extracted from the
    // token snapshot.
    uint supply;
    // Snapshot id
    uint snapshot;
    // If the poll is for an meeting, link to the meetingId
    uint meetingId;
    // Number of options.
    uint8 options;
    // Number of voters.
    uint16 voters;
  }

  struct Meeting {
    uint start;
    uint end;
    uint pollId;
  }

  Poll[] public polls;
  Meeting[] public meetings;

  mapping(uint => uint[]) public pollToVotes;

  // A poll is connected to a bitmap of voters.
  // Given a pollId, we retrieve its bitmap of voters that is a mapping
  // divided into smaller bitmaps of 256 voters.
  mapping(uint => mapping(uint8 => uint)) public pollToVoters;

  function createPoll(uint cid, uint secondsAfter, uint8 options) public returns(uint){
    require(addressToMember[_msgSender()] != 0, "Sender is not a member");
    require(secondsAfter >= 3600, "Poll too short");
    require(options > 1, "Poll must have at least 2 options");
    require(options <= 8, "Poll must have less than 9 options");

    SayToken token = SayToken(tokenAddress);
    // Take a snapshot of the ERC20 token distribution.
    uint snapshot = token.snapshot();

    Poll memory poll = Poll(
      cid,
      block.timestamp + secondsAfter,
      token.totalSupply(),
      snapshot,
      NULL,
      options,
      0);
    polls.push(poll);

    for (uint8 i = 0; i < options; i++) {
      pollToVotes[polls.length - 1].push(0);
    }
    return polls.length - 1;
  }

  function createMeetingPoll(uint cid, uint secondsAfter, uint start, uint end) public returns(uint){
    require(addressToMember[_msgSender()] != 0, "Sender is not a member");
    // One week
    require(secondsAfter >= 604800, "Poll too short");
    require(start >= block.timestamp + secondsAfter, "Meeting must start after the poll ends");
    require(start < end, "Meeting must have a positive duration");

    SayToken token = SayToken(tokenAddress);
    // Take a snapshot of the ERC20 token distribution.
    uint snapshot = token.snapshot();

    Poll memory poll = Poll(
      cid,
      block.timestamp + secondsAfter,
      token.totalSupply(),
      snapshot,
      meetings.length,
      2,
      0);

    Meeting memory meeting = Meeting(
      start,
      end,
      polls.length
    );

    polls.push(poll);
    meetings.push(meeting);

    // Push two options, first one for yes, second one for no.
    pollToVotes[polls.length - 1].push(0);
    pollToVotes[polls.length - 1].push(0);

    return polls.length - 1;
  }

  function hasVotedFor(uint pollId, uint16 memberId) view public returns(uint8) {
    // uint16 / 256 = 2^16 / 2^8 = 2^(16-8) = 2^8
    for (uint8 i = 0; i < 8; i++) {
      uint bitmap = pollToVoters[uint(keccak256(abi.encodePacked(pollId, i)))][uint8(memberId / 256)];
      if((bitmap & (1 << (memberId % 256))) > 0) {
        return i;
      }
    }
    return 255;
  }

  function vote(uint pollId, uint8 option) public {
    uint16 memberId = addressToMember[_msgSender()];
    require(memberId != 0, "Sender is not a member");
    require(hasVotedFor(pollId, memberId) == 255, "Member voted already");

    // Load the poll
    Poll storage poll = polls[pollId];

    // Load token contract
    SayToken token = SayToken(tokenAddress);

    require(poll.cid != 0, "Poll doesn't exist");
    require(poll.end > block.timestamp, "Poll is closed");
    require(option < poll.options, "Invalid option");
    require(token.balanceOfAt(_msgSender(), poll.snapshot) > 0, "Member has no tokens");

    poll.voters++;

    // FIXME: add "SafeMath"
    pollToVotes[pollId][option] += token.balanceOfAt(_msgSender(), poll.snapshot);

    // uint16 / 256 = 2^16 / 2^8 = 2^(16-8) = 2^8
    pollToVoters[uint(keccak256(abi.encodePacked(pollId, option)))][uint8(memberId / 256)] |= 1 << (memberId % 256);
  }

  function getVotes(uint pollId) view public returns(uint[8] memory result) {
    Poll memory poll = polls[pollId];
    for (uint8 option = 0; option < poll.options; option++) {
      result[option] = pollToVotes[pollId][option];
    }
  }

  function totalPolls() view public returns(uint) {
    return polls.length;
  }

  // ## Token methods

  function setTokenAddress(address a) public {
    tokenAddress = a;
  }

}
