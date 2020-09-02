const assert = require("assert").strict;
const etherea = require("etherea");
const { deployAll } = require("./utils");

function merge(address, id) {
  return etherea.BigNumber.from(address).shl(96).or(id);
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
      index: 1,
    });
    carol = await etherea.wallet({
      endpoint: "localhost",
      index: 2,
    });
    mallory = await etherea.wallet({
      endpoint: "localhost",
      index: 3,
    });
    const contracts = await deployAll(alice);

    alice.loadContracts(contracts);
    bob.loadContracts(contracts);
    carol.loadContracts(contracts);
    mallory.loadContracts(contracts);
  });

  it("has an owner", async () => {});

  it("allows invites", async () => {
    // Alice is the owner of the DAO, and she wants to invite Bob.
    // She creates an invite as a signed message with Bob's member id.
    const aliceInvite = await alice.signMessage(
      "Member: 42\nContract: " + alice.contracts.SayDAO.address.toLowerCase()
    );

    // Bob receives the invitation and splits the signature before
    // sending it to the smart contract to join the DAO.
    const { r: aliceR, s: aliceS, v: aliceV } = etherea.signature.split(
      aliceInvite
    );
    await bob.contracts.SayDAO.join(42, aliceV, aliceR, aliceS);

    // Bob should be now registered as a member with id 42
    assert.equal(await bob.contracts.SayDAO.memberToAddress(42), bob.address);
    assert.equal(await bob.contracts.SayDAO.addressToMember(bob.address), 42);

    // Mallory wants to join as well, but she is not invited. She tries
    // to replay Bob's invite but the smart contract rejects her request.
    // FIXME:
    // await assert.rejects(
    //   mallory.contracts.SayDAO.join(42, aliceV, aliceR, aliceS)
    // );

    // Mallory tries again self-signing an invite, but she fails.
    const malloryInvite = await mallory.signMessage(
      "Member: 101\nContract: " + alice.contracts.SayDAO.address
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
