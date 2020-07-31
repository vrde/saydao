import { writable, derived } from "svelte/store";
import baseX from "base-x";
import { push } from "svelte-spa-router";
import { wallet } from "src/state/eth";
import { Buffer } from "buffer";
import { memberId } from "./";

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

export const pollList = derived(
  wallet,
  async ($wallet, set) => {
    if (!$wallet) return;
    const totalPolls = await $wallet.contracts.SayDAO.totalPolls();
    const list = [];
    for (let i = 0; i < totalPolls; i++) {
      const poll = await $wallet.contracts.SayDAO.polls(i);
      const content = await getPollFromIpfs(poll.cid.toHexString());
      content.id = i;
      content.end = utcTimestampToDate(poll.end.toNumber());
      list.push(content);
    }
    set(list);
  },
  []
);

export const currentPoll = derived(
  [wallet, currentPollId, memberId],
  async ([$wallet, $currentPollId, $memberId], set) => {
    if (!$wallet || $currentPollId === undefined || $memberId === undefined)
      return;
    set(undefined);
    const poll = await $wallet.contracts.SayDAO.polls($currentPollId);
    const content = await getPollFromIpfs(poll.cid.toHexString());
    content.id = $currentPollId;
    content.end = utcTimestampToDate(poll.end.toNumber());
    content.hasVoted = await $wallet.contracts.SayDAO.hasVoted(
      $currentPollId,
      $memberId
    );
    set(content);
  }
);
