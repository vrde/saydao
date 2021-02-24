// # SayDAO contract
//
// SayDAO is an invite only DAO.

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";
import "@opengsn/gsn/contracts/interfaces/IKnowForwarderAddress.sol";
import "./SayToken.sol";

contract SayDAO is BaseRelayRecipient, IKnowForwarderAddress, AccessControl {
    event CreatePoll(uint256 pollId);
    event Vote(uint256 pollId);
    event Seal(uint256 pollId);
    event AllocationDone(uint256 pollId);

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    uint256 public constant PAGE_SIZE = 32;
    uint256 public constant NULL =
        0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    address public tokenAddress;

    // OPENGSN
    string public override versionRecipient = "2.0.0";

    function getTrustedForwarder() public view override returns (address) {
        return trustedForwarder;
    }

    // END OPENGSN

    uint256 public minPollDuration;
    uint256 public minPollMeetingDuration;
    uint256 public timeUnit;

    uint256 public genesis;

    // ## Members
    //
    // Each member is identified by their memberId, that is stored in an array
    // of integers. The memberId is associated to the member's identity.
    uint16[] public members;
    // Each memberId is associated to the member address.
    mapping(uint16 => address) public memberToAddress;
    mapping(address => uint16) public addressToMember;

    constructor(
        uint256 _minPollDuration,
        uint256 _minPollMeetingDuration,
        uint256 _timeUnit,
        address _forwarder
    ) public {
        genesis = block.timestamp;
        minPollDuration = _minPollDuration;
        minPollMeetingDuration = _minPollMeetingDuration;
        timeUnit = _timeUnit;
        trustedForwarder = _forwarder;
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MANAGER_ROLE, _msgSender());
    }

    function _msgSender()
        internal
        view
        override(BaseRelayRecipient, Context)
        returns (address payable)
    {
        return BaseRelayRecipient._msgSender();
    }

    function _msgData()
        internal
        view
        override(BaseRelayRecipient, Context)
        returns (bytes memory)
    {
        return BaseRelayRecipient._msgData();
    }

    // https://github.com/provable-things/ethereum-api/blob/9f34daaa550202c44f48cdee7754245074bde65d/oraclizeAPI_0.5.sol#L1045
    function uint2str(uint256 _i)
        internal
        pure
        returns (string memory _uintAsString)
    {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len - 1;
        while (_i != 0) {
            bstr[k--] = bytes1(uint8(48 + (_i % 10)));
            _i /= 10;
        }
        return string(bstr);
    }

    function address2hex(address a) public pure returns (string memory) {
        bytes32 value = bytes32(uint256(a));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint256(uint8(value[i + 12] >> 4))];
            str[3 + i * 2] = alphabet[uint256(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }

    function join(
        uint16 memberId,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        // To keep thinkgs simple but slightly wrong, an invite can be used more than
        // once to recover the account. Not enough time to fix it properly.
        // require(memberToAddress[memberId] == address(0), "Invite used already");

        // The invite string is something like:
        //
        // Member: 11
        // Contract: 0x....
        bytes memory message =
            abi.encodePacked(
                "Member: ",
                uint2str(memberId),
                "\n",
                "Contract: ",
                address2hex(address(this))
            );

        bytes32 messageHash =
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n",
                    uint2str(message.length),
                    message
                )
            );

        address signer = ecrecover(messageHash, v, r, s);
        require(hasRole(MANAGER_ROLE, signer), "Invite not valid.");
        memberToAddress[memberId] = _msgSender();
        addressToMember[_msgSender()] = memberId;
        members.push(memberId);
        SayToken token = SayToken(tokenAddress);
        token.mint(memberId, 100e18);
    }

    function listMembers(uint256 page)
        public
        view
        returns (uint256[PAGE_SIZE] memory chunk)
    {
        uint256 offset = page * PAGE_SIZE;
        for (uint256 i = 0; i < PAGE_SIZE && i + offset < members.length; i++) {
            uint16 member = members[i + offset];
            chunk[i] =
                (uint256(memberToAddress[member]) << 96) |
                uint256(member);
        }
    }

    function totalMembers() public view returns (uint256) {
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
        uint256 cid;
        // When does the poll ends, UNIX timestamp.
        uint256 end;
        // Total amount of token supply at the time.
        // This is redundand and can be extracted from the
        // token snapshot.
        uint256 tokenSupply;
        // Total token staked.
        uint256 tokenStaked;
        // Snapshot id
        uint256 snapshot;
        // If the poll is for an meeting, link to the meetingId
        uint256 meetingId;
        // Number of options.
        uint8 options;
    }

    Poll[] public polls;

    mapping(uint256 => uint256[]) public pollToVotes;

    // A poll is connected to a bitmap of voters.
    // Given a pollId, we retrieve its bitmap of voters that is a mapping
    // divided into smaller bitmaps of 256 voters.
    mapping(uint256 => mapping(uint8 => uint256)) public pollToVoters;

    function createPoll(
        uint256 cid,
        uint256 secondsAfter,
        uint8 options
    ) public returns (uint256) {
        require(addressToMember[_msgSender()] != 0, "Sender is not a member");
        require(secondsAfter >= minPollDuration, "Poll too short");
        require(options > 1, "Poll must have at least 2 options");
        require(options <= 8, "Poll must have less than 9 options");

        SayToken token = SayToken(tokenAddress);
        // Take a snapshot of the ERC20 token distribution.
        uint256 snapshot = token.snapshot();

        Poll memory poll =
            Poll(
                cid,
                block.timestamp + secondsAfter,
                token.totalSupply(),
                0,
                snapshot,
                NULL,
                options
            );
        polls.push(poll);

        for (uint8 i = 0; i < options; i++) {
            pollToVotes[polls.length - 1].push(0);
        }
        emit CreatePoll(polls.length - 1);
        return polls.length - 1;
    }

    function hasVotedFor(uint256 pollId, uint16 memberId)
        public
        view
        returns (uint8)
    {
        // uint16 / 256 = 2^16 / 2^8 = 2^(16-8) = 2^8
        for (uint8 i = 0; i < 8; i++) {
            uint256 bitmap =
                pollToVoters[uint256(keccak256(abi.encodePacked(pollId, i)))][
                    uint8(memberId / 256)
                ];
            if ((bitmap & (uint256(1) << (memberId % 256))) > 0) {
                return i;
            }
        }
        return 255;
    }

    function vote(uint256 pollId, uint8 option) public {
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
        require(
            token.balanceOfAt(_msgSender(), poll.snapshot) > 0,
            "Member has no tokens"
        );

        uint256 stake = token.balanceOfAt(_msgSender(), poll.snapshot);

        // FIXME: add "SafeMath"
        poll.tokenStaked += stake;
        pollToVotes[pollId][option] += stake;

        // uint16 / 256 = 2^16 / 2^8 = 2^(16-8) = 2^8
        pollToVoters[uint256(keccak256(abi.encodePacked(pollId, option)))][
            uint8(memberId / 256)
        ] |= uint256(1) << (memberId % 256);
        emit Vote(pollId);
    }

    function getVotes(uint256 pollId)
        public
        view
        returns (uint256[8] memory result)
    {
        Poll memory poll = polls[pollId];
        for (uint8 option = 0; option < poll.options; option++) {
            result[option] = pollToVotes[pollId][option];
        }
    }

    function totalPolls() public view returns (uint256) {
        return polls.length;
    }

    /**
     * Meeting methods
     */
    struct Meeting {
        uint256 pollId;
        uint256 start;
        uint256 end;
        uint256 tokenAllocation;
        uint16 supervisor;
        uint16 totalParticipants;
        // 0: initial state
        // 1: participant list sealed
        // 2: token distributed / final state
        uint8 state;
    }

    Meeting[] public meetings;
    // The following data structures hold the participants to a given meetingId.
    // Given that we might have more than 256 participants, we split them into
    // clusters.
    // The meetingToClusters array contains the numer of the cluster.
    // The meetingToParticipants array contains the bitmap.
    // Let's say member 1, 3, and 514 participate to a meeting, the structures
    // will look like:
    // [0, 2]
    // [b0101, b001]
    mapping(uint256 => uint8[]) public meetingToClusters;
    mapping(uint256 => uint256[]) public meetingToParticipants;

    function createMeetingPoll(
        uint256 cid,
        uint256 secondsAfter,
        uint256 start,
        uint256 end,
        uint16 supervisor
    ) public returns (uint256) {
        require(addressToMember[_msgSender()] != 0, "Sender is not a member");
        require(secondsAfter >= minPollMeetingDuration, "Poll too short");
        require(
            start >= block.timestamp + secondsAfter,
            "Meeting must start after the poll ends"
        );
        require(start <= end, "Meeting must have a positive duration");
        require(
            memberToAddress[supervisor] != address(0),
            "Event manager is not a member"
        );

        SayToken token = SayToken(tokenAddress);
        // Take a snapshot of the ERC20 token distribution.
        uint256 snapshot = token.snapshot();

        Poll memory poll =
            Poll(
                cid,
                block.timestamp + secondsAfter,
                token.totalSupply(),
                0,
                snapshot,
                meetings.length,
                2
            );

        Meeting memory meeting =
            Meeting(polls.length, start, end, 0, supervisor, 0, 0);

        polls.push(poll);
        meetings.push(meeting);

        // Push two options, first one for yes, second one for no.
        pollToVotes[polls.length - 1].push(0);
        pollToVotes[polls.length - 1].push(0);

        emit CreatePoll(polls.length - 1);
        return polls.length - 1;
    }

    function isMeetingValid(uint256 meetingId) public view returns (bool) {
        Meeting memory meeting = meetings[meetingId];
        Poll memory poll = polls[meeting.pollId];

        return
            // Did the poll reached quorum?
            (poll.tokenStaked / (poll.tokenSupply / 100) >= 33) &&
            // Did the majority voted "yes"?
            (pollToVotes[meeting.pollId][0] > pollToVotes[meeting.pollId][1]);
    }

    function updateMeetingParticipants(
        uint256 meetingId,
        uint8 cluster,
        uint256 bitmap
    ) public {
        require(meetingId < meetings.length, "Meeting doesn't exist");
        Meeting storage meeting = meetings[meetingId];
        require(
            addressToMember[_msgSender()] == meeting.supervisor,
            "Only supervisor can set participants"
        );
        require(meeting.end < block.timestamp, "Meeting is not finished");
        require(meeting.state == 0, "Meeting cannot be updated");
        require(isMeetingValid(meetingId), "Meeting is not valid");

        // Iterate over bitmap to check if they are all members
        uint8 currentParticipants;
        for (uint256 i = 0; i < 256; i++) {
            if ((bitmap & (uint256(1) << i)) > 0) {
                uint16 memberId = uint16(cluster * 256 + i);
                require(
                    memberToAddress[memberId] != address(0),
                    "Participant is not a member"
                );
                currentParticipants++;
            }
        }

        // Upper bound is 256, because we can have up to 256 clusters (but that's very unlikely).
        uint256 index;
        while (
            index < meetingToClusters[meetingId].length &&
            meetingToClusters[meetingId][index] != cluster
        ) {
            index++;
        }

        if (index == meetingToClusters[meetingId].length) {
            meetingToClusters[meetingId].push(cluster);
            meetingToParticipants[meetingId].push(bitmap);
            meeting.totalParticipants += currentParticipants;
        } else {
            uint8 previousParticipants =
                countBits(meetingToParticipants[meetingId][cluster]);
            meeting.totalParticipants =
                (meeting.totalParticipants - previousParticipants) +
                currentParticipants;
            meetingToParticipants[meetingId][index] = bitmap;
        }
    }

    function calculateTokenAllocation(
        uint256 secondsSinceGenesis,
        uint256 participants,
        uint256 total
    ) public view returns (uint256) {
        // This should be overflow safe... let's say the dao is running in 100 years,
        // that is ~3153600000 seconds < 1e10, and timeUnit is 1, we would have:
        // microTicks < 1e10 * 1e6 ≡ microTicks < 1e(10+6) ≡ microTicks < 1e16
        // microFactor < 2e6 < 1e7 (switch to 1eN to simplify)
        // microTicks * microFactor < 1e16 * 1e7 ≡ microTicks * microFactor < 1e23
        // ans ** 2 < 1e23 ** 2 ≡ ans < 1e46 that is within the limit of ~1e77 of a uint.
        //
        // All that said, tokens allocated are:
        // (1e6 * 1e6) ** 2 ≡ 1e12 ** 2 ≡ 1e24
        // SayToken decimals are 18, so we need to remove 6 orders of magnitude
        // from the calculated value... I guess :P
        uint256 microTicks = (secondsSinceGenesis * 1e6) / timeUnit;
        uint256 microFactor = 1e6 + (participants * 1e6) / total;
        return ((microTicks * microFactor)**2) / 1e6;
    }

    function sealMeetingParticipants(uint256 meetingId) public {
        require(meetingId < meetings.length, "Meeting doesn't exist");
        Meeting storage meeting = meetings[meetingId];
        require(
            addressToMember[_msgSender()] == meeting.supervisor,
            "Only supervisor can seal"
        );
        require(meeting.end < block.timestamp, "Meeting is not finished");
        meeting.state = 1;
        meeting.tokenAllocation = calculateTokenAllocation(
            block.timestamp - genesis,
            meeting.totalParticipants,
            members.length
        );
        emit Seal(meeting.pollId);
    }

    function getRemainingDistributionClusters(uint256 meetingId)
        public
        view
        returns (uint256)
    {
        return meetingToClusters[meetingId].length;
    }

    function getNextDistributionBitmap(uint256 meetingId)
        public
        view
        returns (uint256)
    {
        uint256 l = meetingToClusters[meetingId].length;
        return meetingToParticipants[meetingId][l - 1];
    }

    // This method will run until there are no tokens left to distribute
    function distributeMeetingTokens(uint256 meetingId, uint8 bound) public {
        require(meetingId < meetings.length, "Meeting doesn't exist");
        Meeting storage meeting = meetings[meetingId];
        require(
            meeting.state == 1,
            "Meeting must be sealed before distributing tokens"
        );
        uint256 clustersLength = meetingToClusters[meetingId].length;
        require(clustersLength > 0, "All token has been distributed");

        SayToken token = SayToken(tokenAddress);

        // Extract the index of the cluster
        uint256 cluster = meetingToClusters[meetingId][clustersLength - 1];
        // Get the bitmap
        uint256 bitmap = meetingToParticipants[meetingId][clustersLength - 1];

        uint256 i;

        for (i = 0; i < 256 && bound > 0; i++) {
            if ((bitmap & (uint256(1) << i)) > 0) {
                uint16 memberId = uint16(cluster * 256 + i);
                // distribute tokens to memberId
                token.mint(memberId, meeting.tokenAllocation);
                meetingToParticipants[meetingId][clustersLength - 1] &=
                    NULL ^
                    (uint256(1) << i);
                //bitmap &= NULL ^ (1 << i);
                bound--;
            }
        }

        // If we reach the bottom of the bitmap, we can free some space in the
        // blockchain.
        if (i == 256) {
            meetingToClusters[meetingId].pop();
            meetingToParticipants[meetingId].pop();
        }

        if (meetingToClusters[meetingId].length == 0) {
            meeting.state = 2;
            delete meetingToClusters[meetingId];
            delete meetingToParticipants[meetingId];
            emit AllocationDone(meeting.pollId);
        }
    }

    function countBits(uint256 bitmap) public pure returns (uint8 total) {
        for (uint256 i = 0; i < 256; i++) {
            if ((bitmap & (uint256(1) << i)) > 0) {
                total++;
            }
        }
    }

    // ## Token methods

    function setTokenAddress(address a) public {
        tokenAddress = a;
    }
}
