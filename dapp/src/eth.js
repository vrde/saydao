const EVENTS_CACHE = {};

function get(key) {
  //return JSON.parse(localStorage.getItem(key));
  const value = EVENTS_CACHE[key];
  return value === undefined ? null : value;
}

function set(key, value) {
  //localStorage.setItem(key, JSON.stringify(value));
  EVENTS_CACHE[key] = value;
}

function getKey(filter) {
  return [filter.address, ...filter.topics].join(":");

  //const topicsHash = ethers.utils.keccak256(
  //  ethers.utils.toUtf8Bytes(JSON.stringify(filter.topics))
  //);
  //return [filter.address, topicsHash].join(":");
}

function calculateRanges(ranges, range) {
  const newRanges = [];
  let a = range[0];
  let b = range[1];

  const involved = ranges.filter(([c, d]) => a < d && b > c);

  if (ranges.length === 0) {
    return [range];
  }

  for (let i = 0; i < ranges.length; i++) {
    const last = i === ranges.length - 1;
    const [c, d] = ranges[i];

    if (a < c) {
      //        c-------d
      //  a-----b
      //  =======================
      //  a-----b
      if (b <= c) {
        newRanges.push([a, b]);
        break;
      }
      //        c-------d
      //  a-------------b
      //  =======================
      //  a-----c
      else if (b > c && b <= d) {
        newRanges.push([a, c]);
        break;
      }
      //        c-------d
      //  a----------------b
      //  =======================
      //  a-----c       d--b?
      else if (b > d) {
        newRanges.push([a, c]);
        a = d;
        if (last) {
          newRanges.push([d, b]);
        }
      }
    } else if (a <= d) {
      //        c-------d
      //              a-b
      //  =======================
      // void
      if (b <= d) {
        break;
      }
      //        c-------d
      //              a-----b
      //  =======================
      //                d---b?
      a = d;
      if (last) {
        newRanges.push([a, b]);
      }
    } else {
      //        c-------d
      //                  a-b
      //  =======================
      //                  a-b?
      if (last) {
        newRanges.push([a, b]);
      }
    }
  }
  return newRanges;
}

function stripEvent(event, contract) {
  let args = {};
  if (contract) {
    args = contract.interface.parseLog(event).args;
  }
  const e = {
    blockNumber: event.blockNumber,
    logIndex: event.logIndex
  };
  for (let key of Object.keys(args)) {
    if (!key.match(/^\d+$/)) {
      e[key] = args[key];
    }
  }
  return e;
}

export function getLogs(provider, filter, contract) {
  const key = getKey(filter);
  let obj = get(key);
  // Note that our definition of interval is:
  //   [fromBlock, toBlock)
  // Or, in another notation:
  //   fromBlock ≤ n < toBlock
  // So the upper bound is excluded.
  const fromBlock = filter.fromBlock;
  const toBlock = filter.toBlock + 1;
  if (obj === null) {
    obj = {
      ranges: [
        /*[ <from>, <to> ], ...*/
      ],
      events: [
        /* A promise for events */
      ]
    };
    set(key, obj);
  }
  const newRanges = calculateRanges(obj.ranges, [fromBlock, toBlock]);
  let position;
  for (let range of newRanges) {
    const [fromBlock, toBlock] = range;
    const eventsPromise = provider
      .getLogs({
        ...filter,
        fromBlock,
        toBlock: toBlock - 1
      })
      .then(events => events.map(e => stripEvent(e, contract)));
    position = obj.ranges.findIndex(element => fromBlock < element[1]);
    if (position === -1) {
      position = obj.ranges.length;
    }
    obj.ranges.splice(position, 0, range);
    obj.events.splice(position, 0, eventsPromise);
    set(key, obj);
  }

  const chunks = [];

  for (let i = position; i < obj.events.length; i++) {
    chunks.push(obj.events[i]);
  }

  return chunks;
}

let blockNumberPendingPromise;

export async function getBlockNumber(provider) {
  if (blockNumberPendingPromise === undefined) {
    blockNumberPendingPromise = (async () => {
      while (true) {
        try {
          const blockNumber = await provider.getBlockNumber();
          blockNumberPendingPromise = undefined;
          return blockNumber;
        } catch (e) {
          console.error("Error getting block number");
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    })();
  }
  return blockNumberPendingPromise;
}

const FILTER_TO_CALLBACKS = {};

function callbackWorker(callback) {
  let running = false;
  let queue = [];
  return async param => {
    queue.push(param);
    if (running) return;
    running = true;
    while (queue.length) {
      const events = await queue.shift();
      for (let event of events) {
        await callback(event);
      }
    }
    running = false;
  };
}

export function onEvent(provider, contract, filter, callback) {
  const key = getKey(filter);
  if (FILTER_TO_CALLBACKS[key] === undefined) {
    FILTER_TO_CALLBACKS[key] = {
      nextId: 0,
      callbacks: {},
      lastBlockNumber: null
    };
  }
  const obj = FILTER_TO_CALLBACKS[key];
  const callbackId = obj.nextId;
  callback = callbackWorker(callback);
  obj.nextId++;
  obj.callbacks[callbackId] = callback;
  _sync(obj.callbacks[callbackId], callbackId);

  async function _sync(callback, callbackId) {
    const blockNumber = await getBlockNumber(provider);
    if (callbackId === 0) {
      obj.lastBlockNumber = blockNumber;
      _checkBlock();
    }
    // Events from `blockNumber` are processed by `_checkBlock`,
    // so we query from `filter.fromBlock` to `blockNumber - 1`
    getLogs(
      provider,
      {
        ...filter,
        toBlock: blockNumber
      },
      contract
    ).forEach(events => callback(events));
  }

  async function _checkBlock() {
    const blockNumber = await getBlockNumber(provider);
    if (obj.lastBlockNumber < blockNumber) {
      getLogs(
        provider,
        {
          ...filter,
          fromBlock: obj.lastBlockNumber + 1,
          toBlock: blockNumber
        },
        contract
      ).forEach(events => Object.values(obj.callbacks).forEach(c => c(events)));
      obj.lastBlockNumber = blockNumber;
    }
    window.setTimeout(_checkBlock, 5000);
  }
  return () => {
    delete obj.callbacks[callbackId];
  };
}
