import { writable, derived } from "svelte/store";
import baseX from "base-x";
import { push } from "svelte-spa-router";
import { wallet } from "src/state/eth";
import { Buffer } from "buffer";
import { memberId } from "./";
import ehterea from "etherea";

const bs58 = baseX(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
);

// FIXME: should not use an object from window
//const ipfs = IpfsHttpClient("https://ipfs.infura.io:5001");
const ipfs = IpfsHttpClient("http://localhost:5001");

async function getPollFromIpfs(cid) {
  const realCid = bs58.encode(Buffer.from("1220" + cid.substr(2), "hex"));
  let data = new Uint8Array();
  let dataRead = 0;
  const chunks = [];
  for await (const chunk of ipfs.cat(realCid)) {
    chunks.push(chunk);
    const tmp = new Uint8Array(data.byteLength + chunk.byteLength);
    tmp.set(chunk, data.byteLength);
    data = tmp;
    dataRead += chunk.byteLength;
  }
  const raw = new TextDecoder("utf-8").decode(data);
  const content = JSON.parse(raw);
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
  wallet,
  async ($wallet, set) => {
    if (!$wallet) return;
    const now = new Date();
    const totalPolls = await $wallet.contracts.SayDAO.totalPolls();
    const list = [];
    for (let i = 0; i < totalPolls; i++) {
      const poll = await $wallet.contracts.SayDAO.polls(i);
      const content = await getPollFromIpfs(poll.cid.toHexString());
      content.id = i;
      content.end = utcTimestampToDate(poll.end.toNumber());
      content.open = now < content.end;
      list.push(content);
    }
    list.sort((a, b) => a.end - b.end);
    set(list);
  },
  []
);

export const openPolls = derived(pollList, $pollList => {
  return $pollList.filter(poll => poll.open);
});

export const closedPolls = derived(pollList, $pollList => {
  return $pollList.filter(poll => !poll.open);
});

export const currentPoll = derived(
  [wallet, currentPollId, memberId, refresh],
  async ([$wallet, $currentPollId, $memberId, $refresh], set) => {
    if (!$wallet || $currentPollId === undefined || $memberId === undefined)
      return;
    set(undefined);

    const now = new Date();
    const poll = await $wallet.contracts.SayDAO.polls($currentPollId);
    const content = await getPollFromIpfs(poll.cid.toHexString());
    const hasVotedFor = await $wallet.contracts.SayDAO.hasVotedFor(
      $currentPollId,
      $memberId
    );

    const supply = poll.supply;
    const votes = await $wallet.contracts.SayDAO.getVotes($currentPollId);
    const totalVotes = votes.reduce(
      (acc, curr) => acc.add(curr),
      etherea.BigNumber.from(0)
    );
    const votesPerc = votes.map(vote =>
      totalVotes.isZero()
        ? 0
        : vote
            .mul(10000)
            .div(totalVotes)
            .toNumber() / 100
    );
    const totalVotesPerc = totalVotes.isZero()
      ? 0
      : totalVotes
          .mul(10000)
          .div(supply)
          .toNumber() / 100;

    content.id = $currentPollId;
    content.end = utcTimestampToDate(poll.end.toNumber());
    content.open = now < content.end;
    content.hasVotedFor = hasVotedFor === 255 ? null : hasVotedFor;
    content.votesPerc = votesPerc;
    content.totalVotesPerc = totalVotesPerc;
    content.quorumReached = totalVotesPerc >= 33;
    content.toQuorum = 33 - totalVotesPerc;

    console.log("content", content);
    set(content);
  }
);
