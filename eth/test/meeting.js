const assert = require("assert").strict;
const etherea = require("etherea");
const {
  createBitmaps,
  deployAll,
  increaseTime,
  takeSnapshot,
  revertSnapshot,
  toBinary,
  add,
} = require("./utils");

const ONE_DAY = 60 * 60 * 24;
const ONE_WEEK = ONE_DAY * 7;
const ONE_MONTH = ONE_DAY * 30;

const now = () => Math.round(Date.now() / 1000);

describe("SayDAO Meeting Poll", async () => {
  let snapshotId;
  let alice;
  let bob;
  let carol;
  let dan;
  let erin;
  let mallory;

  beforeEach(async () => {
    snapshotId = await takeSnapshot();

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

    await add(alice, alice, 1);
    await add(alice, bob, 2);
    await add(alice, carol, 3);
    await add(alice, dan, 4);
    await add(alice, erin, 666);
    // Sorry Mallory you are not invited.
  });

  afterEach(async () => {
    await revertSnapshot(snapshotId);
  });

  it("allows a member to create a meeting poll and vote", async () => {
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
        end,
        1
      )
    );

    let poll = await alice.contracts.SayDAO.polls(0);
    const meeting = await alice.contracts.SayDAO.meetings(0);

    assert.equal(poll.cid.toHexString(), cid);
    assert(poll.meetingId.eq(0));
    assert.equal(poll.options, 2);
    assert(poll.tokenStaked.isZero());
    assert(poll.snapshot.eq(1));

    assert(meeting.pollId.eq(0));
    assert.equal(meeting.supervisor, 1);
    assert.equal(meeting.start.toNumber(), start);
    assert.equal(meeting.end.toNumber(), end);
    assert.equal(meeting.state, 0);

    // Now Bob and Carol vote, yay!
    await bob.contracts.SayDAO.vote(0, 1);
    await carol.contracts.SayDAO.vote(0, 1);

    poll = await alice.contracts.SayDAO.polls(0);
    assert.equal(poll.cid.toHexString(), cid);
    assert.equal(poll.tokenStaked.toString(), "200000000000000000000");
  });

  it("should invalidate meeting proposals without quorum", async () => {
    const cid =
      "0x5f9921586542097d33e99dabc8ef759b122f20b9a77ead6a86f70e9b0af20f05";
    const secondsAfter = ONE_WEEK;
    const start = now() + ONE_MONTH;
    const end = start + ONE_DAY;
    await bob.contracts.SayDAO.createMeetingPoll(
      cid,
      secondsAfter,
      start,
      end,
      // Alice is the supervisor
      1
    );

    // Alice vote "yes" but that's not enough to reach the quorum
    await alice.contracts.SayDAO.vote(0, 0);

    // Let's do the time warp again
    increaseTime(end + ONE_DAY);

    // alice
    const participantsBitmap = createBitmaps([1]);

    // Now the supervisor can update the participants
    for (const clusterId of Object.keys(participantsBitmap)) {
      await assert.rejects(
        alice.contracts.SayDAO.updateMeetingParticipants(
          0,
          clusterId,
          participantsBitmap[clusterId]
        )
      );
    }
  });

  it("should invalidate meeting proposals without a 'yes' majority", async () => {
    const cid =
      "0x5f9921586542097d33e99dabc8ef759b122f20b9a77ead6a86f70e9b0af20f05";
    const secondsAfter = ONE_WEEK;
    const start = now() + ONE_MONTH;
    const end = start + ONE_DAY;
    await bob.contracts.SayDAO.createMeetingPoll(
      cid,
      secondsAfter,
      start,
      end,
      // Alice is the supervisor
      1
    );

    await alice.contracts.SayDAO.vote(0, 1);
    await bob.contracts.SayDAO.vote(0, 1);
    await carol.contracts.SayDAO.vote(0, 1);
    await dan.contracts.SayDAO.vote(0, 0);
    await erin.contracts.SayDAO.vote(0, 0);

    // Let's do the time warp again
    increaseTime(end + ONE_DAY);

    // alice
    const participantsBitmap = createBitmaps([1]);

    // Now the supervisor can update the participants
    for (const clusterId of Object.keys(participantsBitmap)) {
      await assert.rejects(
        alice.contracts.SayDAO.updateMeetingParticipants(
          0,
          clusterId,
          participantsBitmap[clusterId]
        )
      );
    }
  });

  it("calculates an exponential token allocation", async () => {
    const formula = (delta, participation) =>
      ((delta / ONE_DAY) * (1 + participation)) ** 2;
    const round = (v) => v.div(etherea.BigNumber.from(10).pow(18)).toNumber();
    const verify = async (secondsSinceGenesis, participants, total) => {
      const expected = Math.floor(
        formula(secondsSinceGenesis, participants / total)
      );
      console.log(
        "Delta",
        secondsSinceGenesis,
        "participants",
        participants,
        "total",
        total,
        "tokens",
        expected
      );
      assert.equal(
        round(
          await alice.contracts.SayDAO.calculateTokenAllocation(
            secondsSinceGenesis,
            participants,
            total
          )
        ),
        expected
      );
    };

    await verify(ONE_DAY, 8, 10);
    await verify(ONE_MONTH, 30, 50);
    await verify(2 * ONE_MONTH, 10, 50);
  });

  it("allows the supervisor to create a participant list", async () => {
    const balanceOf = async (account) =>
      (await alice.contracts.SayToken.balanceOf(account))
        .div(etherea.BigNumber.from(10).pow(18))
        .toNumber();
    const cid =
      "0x5f9921586542097d33e99dabc8ef759b122f20b9a77ead6a86f70e9b0af20f05";
    const secondsAfter = ONE_WEEK;
    const start = now() + ONE_MONTH;
    const end = start + ONE_DAY;

    await bob.contracts.SayDAO.createMeetingPoll(
      cid,
      secondsAfter,
      start,
      end,
      // Alice is the supervisor
      1
    );

    let meeting = await alice.contracts.SayDAO.meetings(0);
    assert.equal(meeting.state, 0);
    // Alice, Bob and Carol vote "no"
    await alice.contracts.SayDAO.vote(0, 0);
    await bob.contracts.SayDAO.vote(0, 0);
    await carol.contracts.SayDAO.vote(0, 0);

    // Let's do the time warp again
    increaseTime(ONE_MONTH + 2 * ONE_DAY);

    // alice, bob, dan, erin
    const participantsBitmap = createBitmaps([1, 2, 4, 666]);

    // Now the supervisor can update the participants
    for (const clusterId of Object.keys(participantsBitmap)) {
      await alice.contracts.SayDAO.updateMeetingParticipants(
        0,
        clusterId,
        participantsBitmap[clusterId]
      );
    }

    meeting = await alice.contracts.SayDAO.meetings(0);
    assert.equal(meeting.totalParticipants, 4);
    assert.equal(meeting.state, 0);

    // The list of participants has been finalized, Alice seals the list
    await alice.contracts.SayDAO.sealMeetingParticipants(0);

    meeting = await alice.contracts.SayDAO.meetings(0);
    assert.equal(meeting.state, 1);

    console.log(
      "token allocation is",
      (await alice.contracts.SayDAO.meetings(0)).tokenAllocation.toString()
    );

    assert.equal(await balanceOf(alice.address), 100);
    assert.equal(await balanceOf(bob.address), 100);
    assert.equal(await balanceOf(carol.address), 100);
    assert.equal(await balanceOf(dan.address), 100);
    assert.equal(await balanceOf(erin.address), 100);

    //console.log(
    //  "Distribution bitmap",
    //  toBinary(await alice.contracts.SayDAO.getNextDistributionBitmap(0))
    //);

    // Alice starts distributing the tokens for event 0 in batches of 32.
    // Distribution starts from the end, and we have only Erin in the last
    // batch. Given that all tokens for that batch are distributed,
    // the batch is destroyed.
    await alice.contracts.SayDAO.distributeMeetingTokens(0, 32);

    meeting = await alice.contracts.SayDAO.meetings(0);
    assert.equal(meeting.state, 1);

    // We have one cluster left
    assert.equal(
      (
        await alice.contracts.SayDAO.getRemainingDistributionClusters(0)
      ).toNumber(),
      1
    );

    meeting = await alice.contracts.SayDAO.meetings(0);
    assert.equal(meeting.state, 1);

    assert.equal(await balanceOf(alice.address), 100);
    assert.equal(await balanceOf(bob.address), 100);
    assert.equal(await balanceOf(carol.address), 100);
    assert.equal(await balanceOf(dan.address), 100);
    // We processed the last cluster that contained Erin's participation
    assert.equal(await balanceOf(erin.address), 3417);

    //console.log(
    //  "Distribution bitmap",
    //  toBinary(await alice.contracts.SayDAO.getNextDistributionBitmap(0))
    //);

    // Alice goes for the second round.
    await alice.contracts.SayDAO.distributeMeetingTokens(0, 32);

    assert.equal(await balanceOf(alice.address), 3417);
    assert.equal(await balanceOf(bob.address), 3417);
    assert.equal(await balanceOf(carol.address), 100);
    assert.equal(await balanceOf(dan.address), 3417);
    assert.equal(await balanceOf(erin.address), 3417);

    assert.equal(
      (
        await alice.contracts.SayDAO.getRemainingDistributionClusters(0)
      ).toNumber(),
      0
    );

    meeting = await alice.contracts.SayDAO.meetings(0);
    assert.equal(meeting.state, 2);
  });
});
