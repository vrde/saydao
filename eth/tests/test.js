const contracts = require("../dist/contracts.json");
const etherea = require("etherea");

async function test() {
  const wallet = await etherea.getWallet("http://localhost:8545");
  wallet.loadContracts(contracts);
  const saydao = wallet.contracts.SayDAO;
  const owner = await saydao.getOwner();
  await saydao.setValue(666);
  console.log("owner is", owner);
  console.log("value is", (await saydao.value()).toString());
}

async function run() {
  try {
    await test();
  } catch (e) {
    console.log(e);
  }
}

run();
