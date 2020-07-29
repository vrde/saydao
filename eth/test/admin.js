const assert = require("assert").strict;
const etherea = require("etherea");
const { compile, deploy } = require("etherea/lib/solidity");

describe("SayDAO ACL", async () => {
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
    const contracts = await deploy(
      await compile("./contracts/SayDAO.sol"),
      alice,
      "0x0000000000000000000000000000000000000000"
    );

    alice.loadContracts(contracts);
    bob.loadContracts(contracts);
    carol.loadContracts(contracts);
    mallory.loadContracts(contracts);
  });

  it("should have alice as the admin", async () => {
    const saydao = alice.contracts.SayDAO;
    const defaultAdminRole = await saydao.DEFAULT_ADMIN_ROLE();
    assert(await saydao.hasRole(defaultAdminRole, alice.address));
  });

  it("should allow alice to invite admins", async () => {
    // await alice.contracts.SayDAO.
  });
});
