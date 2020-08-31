import { readable } from "svelte/store";

const BLOCK_THRESHOLD = 1024;

async function getBlockNumber() {
  return await wallet.provider.getBlockNumber();
}

function getLastSync() {
  return db.get("member:lastSyncBlockNumber", 0);
}

function get(wallet, id) {
  return readable(null, set => {
    const currentBlockNumber = getBlockNumber();
    const lastSyncBlockNumber = getLastSync();
    // If we are lagging behind, we iterate over all members in the
    // smart contract and update the store.
    if (currentBlockNumber - lastSyncBlockNumber > BLOCK_THRESHOLD) {
      // load from upstream
    } else {
      // use the cached value
      // and subscribe to updates
    }

    return () => {
      /* unsubscribe */
    };
  });
}

function getAll(wallet, filter) {
  return readable(null, set => {
    const objects = {};

    return () => {
      /* unsubscribe */
    };
  });
}

// key => {
//  fromBlockNumber: blockNumber,
//  events: []
// }
const EVENTS = {};

async function getPastEvents(contract, eventName, fromBlockNumber) {
  const key = [contract.address, eventName].join(":");

  function onEvent(...args) {
    const event = args.pop();
    EVENTS[key].events.push(event);
  }

  if (EVENTS[key] === undefined) {
    EVENTS[key] = {
      fromBlockNumber,
      events: []
    };
    const pastEvents = await contract.queryFilter(eventName, fromBlockNumber);
    EVENTS[key].events = await contract.queryFilter(eventName, fromBlockNumber);
  } else if (EVENTS[key].fromBlockNumber > fromBlockNumber) {
    const pastEvents = await contract.queryFilter(
      eventName,
      fromBlockNumber,
      EVENTS[key].fromBlockNumber - 1
    );
    EVENTS[key] = {
      fromBlockNumber,
      events: pastEvents.concat(EVENTS[key].events)
    };
  }

  return EVENTS[key].events.filter(e => e.blockNumber >= fromBlockNumber);
}

async function onEvent(contract, eventName, fromBlockNumber, callback) {
  const pastEvents = 0;
}

function sync(model, id, loader, event) {
  return readable(null, set => {
    const currentBlockNumber = getBlockNumber();
    const lastSyncBlockNumber = getLastSync();
    const key = [model, id].join(":");
    let value;

    // If we are lagging behind, we iterate over all members in the
    // smart contract and update the store.
    if (currentBlockNumber - lastSyncBlockNumber > BLOCK_THRESHOLD) {
      value = loader(id);
    } else {
      value = db.get(key);
    }

    onEvents(contract, event, lastSyncBlockNumber, loader);

    return () => {
      /* unsubscribe */
    };
  });
}
