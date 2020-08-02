const assert = require("assert").strict;
const etherea = require("etherea");
const { deployAll } = require("./utils");

const ONE_DAY = 60 * 60 * 24;
const ONE_WEEK = ONE_DAY * 7;
const ONE_MONTH = ONE_DAY * 30;

const now = () => Math.round(Date.now());

async function add(from, to, id) {
  const invite = await from.signMessage(etherea.to.array.uint16(id));
  const { r, s, v } = etherea.signature.split(invite);
  await to.contracts.SayDAO.join(id, v, r, s);
}

describe("SayDAO Meeting Poll", async () => {
  let alice;
  let bob;
  let carol;
  let dan;
  let erin;
  let mallory;

  before(async () => {
    alice = await etherea.wallet({ endpoint: "localhost" });
    bob = await etherea.wallet({
      endpoint: "localhost",
      index: 1,
    });
    carol = await etherea.wallet({
      endpoint: "localhost",
      index: 2,
    });
    dan = await etherea.wallet({
      endpoint: "localhost",
      index: 4,
    });
    erin = await etherea.wallet({
      endpoint: "localhost",
      index: 5,
    });
    mallory = await etherea.wallet({
      endpoint: "localhost",
      index: 6,
    });

    // Alice deploys SayDAO
    const contracts = await deployAll(alice);

    alice.loadContracts(contracts);
    bob.loadContracts(contracts);
    carol.loadContracts(contracts);
    dan.loadContracts(contracts);
    erin.loadContracts(contracts);
    mallory.loadContracts(contracts);

    await add(alice, bob, 1);
    await add(alice, carol, 2);
    await add(alice, dan, 3);
  });

  it("allow a member to create a meeting poll and vote", async () => {
    const cid =
      "0x5f9921586542097d33e99dabc8ef759b122f20b9a77ead6a86f70e9b0af20f05";
    const secondsAfter = ONE_WEEK;
    const start = now() + ONE_MONTH;
    const end = start + ONE_DAY;

    assert(
      await bob.contracts.SayDAO.createMeetingPoll(
        cid,
        secondsAfter,
        start,
        end
      )
    );

    const poll = await alice.contracts.SayDAO.polls(0);
    const meeting = await alice.contracts.SayDAO.meetings(0);

    console.log(poll);
    assert.equal(poll.cid.toHexString(), cid);
    assert(poll.meetingId.eq(0));
    assert.equal(poll.options, 2);
    assert.equal(poll.voters, 0);
    assert(poll.snapshot.eq(1));

    // Now Bob and Carol vote, yay!
    await bob.contracts.SayDAO.vote(0, 1);
    await carol.contracts.SayDAO.vote(0, 1);
  });
});
