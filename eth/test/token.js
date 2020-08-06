const assert = require("assert").strict;
const etherea = require("etherea");
const { deployAll, add } = require("./utils");

describe("SayToken", async () => {
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

    // Alice deploys SayDAO
    const contracts = await deployAll(alice);

    alice.loadContracts(contracts);
    bob.loadContracts(contracts);
    carol.loadContracts(contracts);
    mallory.loadContracts(contracts);
  });

  it("is connected to the DAO smart contract", async () => {
    assert.equal(
      await alice.contracts.SayDAO.tokenAddress(),
      alice.contracts.SayToken.address
    );
    assert.equal(
      await alice.contracts.SayToken.daoAddress(),
      alice.contracts.SayDAO.address
    );
  });

  it("doesn't allow others to set the address of the DAO", async () => {
    await assert.rejects(
      mallory.contracts.SayToken.setDaoAddress(
        "0x0000000000000000000000000000000000000000"
      )
    );
  });

  it("returns the 'balanceOf' a member", async () => {
    await add(alice, bob, 42);
    const balance = await bob.contracts.SayToken.balanceOf(bob.address);
    assert.equal(balance.toString(), "100000000000000000000");
  });
});
