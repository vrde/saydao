import { writable, derived } from "svelte/store";
import baseX from "base-x";
import { push } from "svelte-spa-router";
import { wallet } from "src/state/eth";
import { Buffer } from "buffer";
import { memberId } from "./";
import etherea from "etherea";
import * as ipfs from "src/ipfs";
import * as cache from "src/cache";

const NULL = etherea.BigNumber.from(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);

async function loadPoll(wallet, pollId, memberId) {
  const now = new Date().getTime();
  const key = [wallet.contracts.SayDAO.address, pollId, memberId].join(":");
  const keyPartial = key + ":partial";

  const cached = cache.get(key);
  const cachedPartial = cache.get(keyPartial);

  // If a poll ended already it is fully cached.
  if (cached) {
    return cached;
  }

  // Load data from Ethereum
  const poll = await wallet.contracts.SayDAO.polls(pollId);
  let content;

  // Do we have new votes?
  if (
    cachedPartial &&
    cachedPartial.tokenStaked === poll.tokenStaked.toString()
  ) {
    console.log("cache hit", keyPartial);
    content = cachedPartial;
  } else {
    // Load data from IPFS
    content = await ipfs.get(ipfs.uintToCid(poll.cid.toHexString()));

    let hasVotedFor = 255;
    if (memberId) {
      hasVotedFor = await wallet.contracts.SayDAO.hasVotedFor(pollId, memberId);
    }

    const tokenSupply = poll.tokenSupply;
    const tokenStaked = poll.tokenStaked;
    const tokenLeft = tokenSupply.sub(tokenStaked);

    const votes = await wallet.contracts.SayDAO.getVotes(pollId);
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
      quorumReached &&
      !firstOption[0].eq(secondOption[0]) &&
      (firstOption[0].sub(secondOption[0]).gt(tokenLeft) ||
        poll.end <= new Date())
    ) {
      finalDecision = firstOption[1];
    }

    // How many tokens had the member when the poll was created?
    const tokensAvailableToVote = await wallet.contracts.SayToken.balanceOfAt(
      wallet.address,
      poll.snapshot
    );

    content.id = pollId;
    content.end = utcTimestampToDate(poll.end.toNumber()).getTime();
    content.open = now < content.end;
    content.tokenSupply = tokenSupply.toString();
    content.tokenStaked = tokenStaked.toString();
    content.hasVotedFor = hasVotedFor === 255 ? null : hasVotedFor;
    content.votesPerc = votesPerc;
    content.totalVotesPerc = totalVotesPerc;
    content.quorumReached = quorumReached;
    content.toQuorum = toQuorum;
    content.finalDecision = finalDecision;
    content.hasTokens = tokensAvailableToVote.isZero()
      ? null
      : tokensAvailableToVote.toString();

    console.log("set", keyPartial);
    cache.set(keyPartial, content);
  }

  // Is the poll a meeting?
  if (!poll.meetingId.eq(NULL)) {
    const meeting = await wallet.contracts.SayDAO.meetings(poll.meetingId);
    content.meetingId = poll.meetingId;
    content.isMeeting = true;
    // Hardcode "Yes" and "No" choices.
    content.choices = ["Yes", "No"];
    content.meetingDone = meeting.done;
    content.meetingSupervisor = meeting.supervisor;
    content.meetingStart = new Date(meeting.start.toNumber() * 1000).getTime();
    content.meetingEnd = new Date(meeting.end.toNumber() * 1000).getTime();
    // Option 0 is yes, 1 is no.
    content.meetingValid = content.finalDecision === 0;
    if (
      content.meetingValid &&
      content.meetingSupervisor === memberId &&
      content.meetingEnd < now
    ) {
      if (content.meetingDone) {
        content.meetingNeedsTokenDistribution = !(
          await wallet.contracts.SayDAO.getRemainingDistributionClusters(
            content.meetingId
          )
        ).isZero();
      } else {
        content.meetingNeedsParticipantList = true;
      }
    }
  }

  // Poll ended, we can safely cache it for later use.
  if (content.end < now) {
    console.log("delete key", keyPartial);
    cache.del(keyPartial);
    cache.set(key, content);
  }

  return content;
}

function utcTimestampToDate(timestamp) {
  //const offset = new Date().getTimezoneOffset() * 60;
  //return new Date((timestamp + offset) * 1000);
  return new Date(timestamp * 1000);
}

export const currentPollId = writable();
export const refresh = writable();

export const pollList = derived(
  [wallet, memberId],
  async ([$wallet, $memberId], set) => {
    if (!$wallet || $memberId === undefined) return;
    const totalPolls = await $wallet.contracts.SayDAO.totalPolls();
    const list = [];
    // Backwards because the most recent polls are likey to be the last ones.
    for (let i = totalPolls - 1; i >= 0; i--) {
      list.push(await loadPoll($wallet, i, $memberId));
      list.sort((a, b) => b.end - a.end);
      set(list);
    }
  },
  []
);

export const upcomingMeetings = derived(pollList, $pollList => {
  const now = new Date().getTime();
  return $pollList.filter(
    poll => poll.isMeeting && poll.meetingValid && now < poll.meetingEnd
  );
});

export const pastMeetings = derived(pollList, $pollList => {
  const now = new Date().getTime();
  return $pollList.filter(
    poll => poll.isMeeting && poll.meetingValid && poll.meetingEnd <= now
  );
});

export const actionableMeetings = derived(pollList, $pollList =>
  $pollList.filter(
    poll =>
      poll.meetingNeedsTokenDistribution || poll.meetingNeedsParticipantList
  )
);

export const openPolls = derived(pollList, $pollList =>
  $pollList.filter(poll => poll.open)
);

export const closedPolls = derived(pollList, $pollList =>
  $pollList.filter(poll => !poll.open)
);

export const currentPoll = derived(
  [wallet, currentPollId, memberId, refresh],
  async ([$wallet, $currentPollId, $memberId, $refresh], set) => {
    if (!$wallet || $currentPollId === undefined || $memberId === undefined)
      return;
    set(undefined);
    set(await loadPoll($wallet, $currentPollId, $memberId));
  }
);
