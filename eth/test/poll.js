const assert = require("assert").strict;
const etherea = require("etherea");
const { deployAll } = require("./utils");

async function add(from, to, id) {
  const invite = await from.signMessage(etherea.to.array.uint16(id));
  const { r, s, v } = etherea.signature.split(invite);
  await to.contracts.SayDAO.join(id, v, r, s);
}

describe("SayDAO Poll", async () => {
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

  it("allow a member to create a poll and vote", async () => {
    const cid =
      "0x5f9921586542097d33e99dabc8ef759b122f20b9a77ead6a86f70e9b0af20f05";
    const secondsAfter = 3600;
    const options = 2;

    assert(await bob.contracts.SayDAO.createPoll(cid, secondsAfter, options));

    const poll = await alice.contracts.SayDAO.polls(0);

    //console.log(poll);
    assert.equal(poll.cid.toHexString(), cid);
    assert.equal(poll.options, options);
    assert(poll.tokenStaked.isZero());
    assert(poll.snapshot.eq(1));

    // Now Bob and Carol vote, yay!
    await bob.contracts.SayDAO.vote(0, 1);
    await carol.contracts.SayDAO.vote(0, 0);

    const votes = await bob.contracts.SayDAO.getVotes(0);

    assert(votes[0].eq(await bob.contracts.SayToken.balanceOf(bob.address)));
    assert(
      votes[1].eq(await carol.contracts.SayToken.balanceOf(carol.address))
    );

    // Bob tries to vote again but it doesn't work
    await assert.rejects(bob.contracts.SayDAO.vote(0, 1));
    await assert.rejects(bob.contracts.SayDAO.vote(0, 2));

    assert.equal(await bob.contracts.SayDAO.hasVotedFor(0, 1), 1);
    assert.equal(await carol.contracts.SayDAO.hasVotedFor(0, 2), 0);

    const pollAfterVote = await alice.contracts.SayDAO.polls(0);

    assert.equal(pollAfterVote.cid.toHexString(), cid);
    assert.equal(pollAfterVote.options, options);
    assert.equal(pollAfterVote.tokenStaked.toString(), "200000000000000000000");
    assert.equal(
      pollAfterVote.tokenSupply.toString(),
      (await alice.contracts.SayToken.totalSupply()).toString()
    );
    // should get last block timestamp and do the math
    //assert.equal(poll.end.toNumber(), ???);

    // Erin is added to the DAO.
    await add(alice, erin, 4);

    // but her vote is rejected because she tries to vote on a poll created
    // before her joining.
    await assert.rejects(erin.contracts.SayDAO.vote(0, 1));

    // Carol creates a new poll
    assert(await carol.contracts.SayDAO.createPoll(cid, secondsAfter, options));

    await bob.contracts.SayDAO.vote(1, 0);
    await carol.contracts.SayDAO.vote(1, 0);
    await erin.contracts.SayDAO.vote(1, 0);
  });

  it("doesn't allow a non member to create a poll", async () => {
    await assert.rejects(
      mallory.contracts.SayDAO.createPoll(
        // arbitrary bytes32
        "0x5f9921586542097d33e99dabc8ef759b122f20b9a77ead6a86f70e9b0af20f05",
        1,
        2
      )
    );
  });
});
