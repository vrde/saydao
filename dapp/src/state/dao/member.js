import { readable, derived } from "svelte/store";
import { wallet } from "src/state/eth";
import db from "src/state/db";
import etherea from "etherea";

function prettyBalance(tokens) {
  return etherea.BigNumber.from(tokens)
    .div(etherea.BigNumber.from(10).pow(decimals))
    .toString();
}

function prettyShares(tokens, total) {
  tokens = etherea.BigNumber.from(tokens);
  total = etherea.BigNumber.from(total);
  const factor = etherea.BigNumber.from(1000);
  const owned = tokens.mul(factor);
  const perc = total.gt(0) ? (100 * owned.div(total).toNumber()) / 1000 : 0;
  return perc.toString() + "%";
}

async function get(wallet, id) {
  const address = await wallet.contracts.SayDAO.memberToAddress(id);
  const rawBalance = await wallet.contracts.SayToken.balanceOf(address);
  return { id, address, balance: rawBalance.toString() };
}

async function* getAll(wallet) {
  for (let page = 0; ; page++) {
    const members = await wallet.contracts.SayDAO.listMembers(page);
    for (let member of members) {
      if (member.isZero()) {
        return;
      }
      const address = member.shr(96).toHexString();
      const memberId = member.mask(16).toNumber();
      const rawBalance = await wallet.contracts.SayToken.balanceOf(address);
      yield { id: memberId, address, balance: rawBalance.toString() };
    }
  }
}

async function load(wallet, update, cache, context) {
  const currentBlockNumber = await wallet.provider.getBlockNumber();
  const lastSyncBlockNumber = db.get("member:lastSyncBlockNumber", 0);

  console.log(
    "state/dao/member: current block",
    currentBlockNumber,
    "last synced block",
    lastSyncBlockNumber
  );
  // If we are lagging behind, we iterate over all members in the
  // smart contract and update the store.
  if (currentBlockNumber - lastSyncBlockNumber > 1024) {
    console.log("state/dao/member: data is stale, flush and reload cache");
    // First we flush the cache
    db.get("memberIds", []).forEach(id => db.remove(`member:${id}`));
    db.remove("memberIds");
    for await (let member of getAll(wallet)) {
      if (!context.running) return;
      cache(member);
      update(member);
    }
  }
  // Otherwise we query all past events and update only the records that
  // changed.
  else {
    // First we extract all members from the db and update the storage.
    console.log("state/dao/member: loading past events");
    db.get("memberIds", []).forEach(id => update(db.get(`member:${id}`)));
    const pastEvents = await wallet.contracts.SayToken.queryFilter(
      "Transfer",
      lastSyncBlockNumber
    );
    const toUpdate = new Set();

    // Put all objects to update in a set to avoid updating the same
    // object multiple times.
    for (let e of pastEvents) {
      toUpdate.add(e.args.to);
    }

    for (let id of toUpdate) {
      if (!context.running) return;
      const member = await get(wallet, id);
      cache(member);
      update(member);
    }
  }
  db.set("member:lastSyncBlockNumber", x => Math.max(currentBlockNumber, x));
}

function sync(wallet, update) {
  console.log("state/dao/member: Start sync");

  const context = { running: true };

  const cache = member => {
    db.set(`member:${member.id}`, member);
    db.set(`memberIds`, ids => Array.from(new Set(ids).add(member.id)));
  };

  async function onTransfer(from, to, amount, event) {
    const member = await get(wallet, to);
    console.log("state/dao/member: new event", event, "update member", member);
    cache(member);
    update(member);
    db.set("member:lastSyncBlockNumber", x => Math.max(event.blockNumber, x));
  }

  // Each transfer will trigger an update. Everything here is idempotent,
  // so it's not a huge deal if something is updated twice.
  // few HTTP calls to have a simpler code.
  wallet.contracts.SayToken.on("Transfer", onTransfer);

  // Load is async but we don't wait for it.
  load(wallet, update, cache, context);

  // Return the unsubscribe function.
  return () => {
    context.running = false;
    wallet.contracts.SayToken.off("Transfer", onTransfer);
  };
}

export const objects = derived(wallet, ($wallet, set) => {
  if (!$wallet) return;
  const members = {};
  const update = member => {
    members[member.id] = member;
    set(members);
  };
  const unsubscribe = sync($wallet, update);
  return unsubscribe;
});

export const totalSay = derived(wallet, ($wallet, set) => {
  if (!$wallet) return;
  $wallet.contracts.SayToken.totalSupply().then(v => set(v.toString()));
  async function onTransfer(from, to, amount, event) {
    console.log("state/dao/member: new event", event, "update totalSupply");
    const supply = await $wallet.contracts.SayToken.totalSupply();
    set(supply.toString());
  }
  $wallet.contracts.SayToken.on("Transfer", onTransfer);
  return () => $wallet.contracts.SayToken.off("Transfer", onTransfer);
});

export const decimals = 18;

export const list = derived(
  [objects, totalSay],
  ([$objects, $totalSay]) =>
    $objects &&
    $totalSay &&
    Object.values($objects).map(member => ({
      ...member,
      id: etherea.BigNumber.from(member.id).toNumber(),
      balance: prettyBalance(member.balance),
      shares: prettyShares(member.balance, $totalSay)
    }))
);
