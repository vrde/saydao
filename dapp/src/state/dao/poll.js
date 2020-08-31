import { readable, derived } from "svelte/store";
import db from "src/state/db";
import { wallet } from "src/state/eth";
import { memberId } from "./";
import { onEvent, getBlockNumber } from "src/eth";
import * as ipfs from "src/ipfs";

const NULL = etherea.BigNumber.from(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);

async function _get(wallet, id, memberId) {
  const poll = await wallet.contracts.SayDAO.polls(id);
  const content = await ipfs.get(ipfs.uintToCid(poll.cid.toHexString()));

  const tokenSupply = poll.tokenSupply;
  const tokenStaked = poll.tokenStaked;
  const tokenLeft = tokenSupply.sub(tokenStaked);
  const votes = await wallet.contracts.SayDAO.getVotes(id);
  const votesPerc = votes.map(vote =>
    tokenStaked.isZero()
      ? 0
      : vote
          .mul(10000)
          .div(tokenStaked)
          .toNumber() / 100
  );
  const totalVotesPerc = tokenStaked.isZero()
    ? 0
    : tokenStaked
        .mul(10000)
        .div(tokenSupply)
        .toNumber() / 100;
  const quorumReached = totalVotesPerc >= 33;
  const toQuorum = 33 - totalVotesPerc;
  // How many tokens had the member when the poll was created?
  const tokensAvailableToVote = await wallet.contracts.SayToken.balanceOfAt(
    wallet.address,
    poll.snapshot
  );
  const hasVotedFor = memberId
    ? await wallet.contracts.SayDAO.hasVotedFor(id, memberId)
    : null;

  let extra = {};
  // Is the poll a meeting?
  if (!poll.meetingId.eq(NULL)) {
    const meeting = await wallet.contracts.SayDAO.meetings(poll.meetingId);
    extra = {
      meetingId: poll.meetingId,
      isMeeting: true,
      // Hardcode "Yes" and "No" choices.
      choices: ["Yes", "No"],
      meetingDone: meeting.done,
      meetingSupervisor: meeting.supervisor,
      meetingStart: new Date(meeting.start.toNumber() * 1000).getTime(),
      meetingEnd: new Date(meeting.end.toNumber() * 1000).getTime()
      // Option 0 is yes, 1 is no.
      //meetingValid: finalDecision === 0
    };
  }

  return {
    id: id.toString(),
    title: content.title,
    question: content.question,
    choices: content.choices,
    duration: content.duration,
    end: new Date(poll.end.toNumber() * 1000).getTime(),
    meetingId: poll.meetingId.eq(NULL) ? null : poll.meetingId.toString(),
    tokenSupply: tokenSupply.toString(),
    tokenStaked: tokenStaked.toString(),
    tokenLeft: tokenLeft.toString(),
    votes,
    votesPerc,
    totalVotesPerc,
    quorumReached,
    toQuorum,
    hasVotedFor: hasVotedFor === 255 ? null : hasVotedFor,
    hasTokens: tokensAvailableToVote.isZero()
      ? null
      : tokensAvailableToVote.toString(),
    ...extra
  };
}

export async function getMeetingState(wallet, poll, memberId) {
  const state = {};
  if (
    poll.meetingValid &&
    poll.meetingSupervisor === memberId &&
    poll.meetingEnd < Date.now()
  ) {
    if (poll.meetingDone) {
      state.meetingNeedsTokenDistribution = !(
        await wallet.contracts.SayDAO.getRemainingDistributionClusters(
          etherea.BigNumber.from(poll.meetingId)
        )
      ).isZero();
    } else {
      state.meetingNeedsParticipantList = true;
    }
  }
  return state;
}

function updatePollDynamicFields(poll) {
  const votes = poll.votes.map(v => etherea.BigNumber.from(v));
  // We need to check if there are multiple winning options.
  // This temporary data structure is [ vote (big number), position (int) ]
  const [firstOption, secondOption] = votes
    .map((vote, i) => [vote, i])
    .sort((a, b) => b[0].sub(a[0]));

  // If all of this is true:
  //
  // - We have a quorum.
  // - The two most voted options don't have the same amount of votes.
  // - The distance in votes between the first and second most voted option is
  //   less than the token left.
  //
  // Then we reached a final decision.
  let finalDecision = null;
  if (
    poll.quorumReached &&
    !firstOption[0].eq(secondOption[0]) &&
    (firstOption[0]
      .sub(secondOption[0])
      .gt(etherea.BigNumber.from(poll.tokenLeft)) ||
      poll.end <= Date.now())
  ) {
    finalDecision = firstOption[1];
  }

  poll.open = Date.now() < poll.end;

  poll.finalDecision = finalDecision;
  if (poll.isMeeting) {
    poll.meetingValid = poll.finalDecision === 0;
  }
}

function getPollKey(wallet, id) {
  return [
    wallet.address,
    "contract",
    wallet.contracts.SayDAO.address,
    "poll",
    id
  ].join(":");
}

const OBJECTS = {};

export function get(id, onUpdate) {
  if (OBJECTS[id] === undefined) {
    OBJECTS[id] = derived(
      [wallet, memberId],
      async ([$wallet, $memberId], set) => {
        if (!$wallet || $memberId === undefined) return;
        const key = getPollKey($wallet, id);
        const blockNumber = await getBlockNumber($wallet.provider);

        let poll = db.get(key);

        if (!poll || blockNumber - poll._blockNumber > 1024) {
          poll = await _get($wallet, id, $memberId);
          poll._blockNumber = blockNumber;
          db.set(key, poll);
        }

        updatePollDynamicFields(poll);
        onUpdate && onUpdate(poll);
        set(poll);

        const filter = $wallet.contracts.SayDAO.filters.Vote();
        filter.fromBlock = blockNumber + 1;

        return onEvent(
          $wallet.provider,
          $wallet.contracts.SayDAO,
          filter,
          async event => {
            if (event.pollId.toString() === id) {
              poll = await _get($wallet, id, $memberId);
              poll._blockNumber = blockNumber;
              updatePollDynamicFields(poll);
              onUpdate && onUpdate(poll);
              db.set(key, poll);
              set(poll);
            } else {
              poll = db.get(key);
              poll._blockNumber = blockNumber;
              db.set(key, poll);
            }
          }
        );
      }
    );
  }
  return OBJECTS[id];
}

async function _getAll(wallet, set) {
  const totalPolls = await wallet.contracts.SayDAO.totalPolls();
  // Backwards because the most recent polls are likey to be the last ones.
  for (let i = totalPolls - 1; i >= 0; i--) {
    const id = i.toString();
    get(id).subscribe(poll => {
      if (poll === undefined) return;
      set(poll);
    });
  }
}

const objects = derived(wallet, async ($wallet, set) => {
  if (!$wallet) return;
  const store = {};
  const _set = poll => {
    store[poll.id] = poll;
    set(store);
  };
  const blockNumber = await getBlockNumber($wallet.provider);
  const filter = $wallet.contracts.SayDAO.filters.CreatePoll();
  filter.fromBlock = blockNumber + 1;
  _getAll($wallet, _set);

  return onEvent(
    $wallet.provider,
    $wallet.contracts.SayDAO,
    filter,
    async event => {
      _getAll($wallet, _set);
    }
  );
});

export const open = derived(
  objects,
  $objects =>
    $objects && Object.values($objects).filter(poll => poll && poll.open)
);

export const closed = derived(
  objects,
  $objects =>
    $objects && Object.values($objects).filter(poll => poll && !poll.open)
);

export const upcomingMeetings = derived(objects, $objects => {
  const now = Date.now();
  return (
    $objects &&
    Object.values($objects).filter(
      poll => poll.isMeeting && poll.meetingValid && now < poll.meetingEnd
    )
  );
});

export const pastMeetings = derived(objects, $objects => {
  const now = new Date().getTime();
  return (
    $objects &&
    Object.values($objects).filter(
      poll => poll.isMeeting && poll.meetingValid && poll.meetingEnd <= now
    )
  );
});

export const actionableMeetings = derived(
  objects,
  $objects =>
    $objects &&
    Object.values($objects).filter(
      poll =>
        poll.meetingNeedsTokenDistribution || poll.meetingNeedsParticipantList
    )
);
