const assert = require("assert").strict;
const etherea = require("etherea");
const { compile, deploy } = require("etherea/lib/solidity");

function merge(address, id) {
  return etherea.BigNumber.from(address)
    .shl(96)
    .or(id);
}

describe("SayDAO", async () => {
  let alice;
  let bob;
  let carol;
  let mallory;

  before(async () => {
    alice = await etherea.wallet({ endpoint: "localhost" });
    bob = await etherea.wallet({
      endpoint: "localhost",
      index: 1
    });
    carol = await etherea.wallet({
      endpoint: "localhost",
      index: 2
    });
    mallory = await etherea.wallet({
      endpoint: "localhost",
      index: 3
    });
    const contracts = await deploy(
      await compile("./contracts/SayDAO.sol"),
      alice
    );

    alice.loadContracts(contracts);
    bob.loadContracts(contracts);
    carol.loadContracts(contracts);
    mallory.loadContracts(contracts);
  });

  it("has an owner", async () => {});

  it("allow invites", async () => {
    // Alice is the owner of the DAO, and she wants to invite Bob.
    // She creates an invite as a signed message with Bob's member id.
    const aliceInvite = await alice.signMessage(etherea.to.array.uint16(42));

    // Bob receives the invitation and splits the signature before
    // sending it to the smart contract to join the DAO.
    const { r: aliceR, s: aliceS, v: aliceV } = etherea.signature.split(
      aliceInvite
    );
    await bob.contracts.SayDAO.join(42, aliceV, aliceR, aliceS);

    // Bob should be now registered as a member with id 42
    assert.equal(await bob.contracts.SayDAO.memberToAddress(42), bob.address);

    // Mallory wants to join as well, but she is not invited. She tries
    // to replay Bob's invite but the smart contract rejects her request.
    await assert.rejects(
      mallory.contracts.SayDAO.join(42, aliceV, aliceR, aliceS)
    );

    // Mallory tries again self-signing an invite, but she fails.
    const malloryInvite = await mallory.signMessage(
      etherea.to.array.uint16(101)
    );
    let { r: malloryR, s: malloryS, v: malloryV } = etherea.signature.split(
      malloryInvite
    );
    await assert.rejects(
      mallory.contracts.SayDAO.join(101, malloryV, malloryR, malloryS)
    );

    // Alice takes a look to the members. She finds Bob. No trace about Mallory.
    const members = await alice.contracts.SayDAO.listMembers(0);
    assert(members[0].eq(merge(bob.address, 42)));
    assert(members[1].eq(0));
  });
});
