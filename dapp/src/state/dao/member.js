import { readable, derived } from "svelte/store";
import db from "src/state/db";
import { wallet } from "src/state/eth";
import { onEvent, getBlockNumber } from "src/eth";
import { memberId } from "./";

const OBJECTS = {};

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

async function _get(wallet, id) {
  const address = await wallet.contracts.SayDAO.memberToAddress(id);
  const balance = await wallet.contracts.SayToken.balanceOf(address);

  return { id, address, balance };
}

function getMemberKey(wallet, id) {
  return [
    wallet.address,
    "contract",
    wallet.contracts.SayToken.address,
    "members",
    id
  ].join(":");
}

export function get(id, onUpdate) {
  if (OBJECTS[id] === undefined) {
    OBJECTS[id] = derived(wallet, async ($wallet, set) => {
      if (!$wallet) return;
      const key = getMemberKey($wallet, id);
      const blockNumber = await getBlockNumber($wallet.provider);

      let object = db.get(key);

      if (!object || blockNumber - object._blockNumber > 1024) {
        object = await _get($wallet, id);
        object._blockNumber = blockNumber;
        db.set(key, object);
      }

      onUpdate && onUpdate(object);
      set(object);

      const filter = $wallet.contracts.SayToken.filters.Transfer();
      filter.fromBlock = blockNumber + 1;

      return onEvent(
        $wallet.provider,
        $wallet.contracts.SayToken,
        filter,
        async event => {
          const to = etherea.BigNumber.from(event.to);
          if (to.eq(id)) {
            object = await _get($wallet, id);
            object._blockNumber = blockNumber;
            onUpdate && onUpdate(object);
            db.set(key, object);
            set(object);
          } else {
            object = db.get(key);
            object._blockNumber = blockNumber;
            db.set(key, object);
          }
        }
      );
    });
  }
  return OBJECTS[id];
}

async function _getAll2(wallet, set) {
  const totalObjects = (
    await wallet.contracts.SayDAO.totalMembers()
  ).toNumber();
  for (let i = 1; i < totalObjects + 1; i++) {
    const id = i.toString();
    get(id).subscribe(object => {
      if (object === undefined) return;
      set(object);
    });
  }
}

// Subscribe to a store only once.
const SUBSCRIPTIONS = new Set();

async function _getAll(wallet, set) {
  for (let page = 0; ; page++) {
    const members = await wallet.contracts.SayDAO.listMembers(page);
    for (let member of members) {
      if (member.isZero()) {
        return;
      }
      const address = member.shr(96).toHexString();
      const id = member.mask(16).toNumber();
      //const rawBalance = await wallet.contracts.SayToken.balanceOf(address);
      // That's quite bad, I'm bending spacetime too much.
      if (!SUBSCRIPTIONS.has(id)) {
        get(id).subscribe(object => {
          if (object === undefined) return;
          set(object);
        });
        SUBSCRIPTIONS.add(id);
      }
    }
  }
}

const objects = derived(wallet, async ($wallet, set) => {
  if (!$wallet) return;
  const store = {};
  const _set = object => {
    store[object.id] = object;
    set(store);
  };
  const blockNumber = await getBlockNumber($wallet.provider);
  const filter = $wallet.contracts.SayToken.filters.Transfer();
  filter.fromBlock = blockNumber + 1;
  _getAll($wallet, _set);

  return onEvent(
    $wallet.provider,
    $wallet.contracts.SayToken,
    filter,
    async event => {
      _getAll($wallet, _set);
    }
  );
});

// FIXME: should not be hardcoded.
export const decimals = 18;

export const totalSay = derived(wallet, async ($wallet, set) => {
  if (!$wallet) return;
  const blockNumber = await getBlockNumber($wallet.provider);
  const filter = $wallet.contracts.SayToken.filters.Transfer();
  filter.fromBlock = blockNumber + 1;
  set(await $wallet.contracts.SayToken.totalSupply());

  return onEvent(
    $wallet.provider,
    $wallet.contracts.SayToken,
    filter,
    async event => {
      set(await $wallet.contracts.SayToken.totalSupply());
    }
  );
});

export const list = derived(
  [objects, totalSay],
  ([$objects, $totalSay]) =>
    $objects &&
    $totalSay &&
    Object.values($objects).map(object => ({
      ...object,
      id: etherea.BigNumber.from(object.id).toNumber(),
      balance: prettyBalance(object.balance),
      shares: prettyShares(object.balance, $totalSay)
    }))
);

export const totalMembers = derived(list, $list => $list && $list.length);

export const me = derived(
  [memberId, totalSay],
  ([$memberId, $totalSay], set) => {
    if (!$totalSay) return;
    if ($memberId) {
      return get($memberId).subscribe(
        v =>
          v &&
          set({
            id: v.id,
            balance: prettyBalance(v.balance),
            shares: prettyShares(v.balance, $totalSay)
          })
      );
    } else {
      set(undefined);
    }
  }
);
