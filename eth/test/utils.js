const ethers = require("ethers");
const { compile, deploy } = require("etherea/lib/solidity");

const { BigNumber } = require("etherea");

const ZERO = BigNumber.from(0);
const ONE = BigNumber.from(1);

function createBitmaps(list) {
  const bitmaps = {};
  for (const element of list) {
    const cluster = Math.floor(element / 256);
    const index = element % 256;
    bitmaps[cluster] = (bitmaps[cluster] || ZERO).or(ONE.shl(index));
  }
  return bitmaps;
}

async function deployAll(wallet) {
  const sayDao = await deploy(
    await compile("./contracts/SayDAO.sol"),
    wallet,
    "0x0000000000000000000000000000000000000000"
  );
  wallet.loadContracts(sayDao);
  const sayToken = await deploy(
    await compile("./contracts/SayToken.sol"),
    wallet,
    wallet.contracts.SayDAO.address
  );
  const contracts = { ...sayDao, ...sayToken };
  wallet.loadContracts(contracts);
  await wallet.contracts.SayDAO.setTokenAddress(
    wallet.contracts.SayToken.address
  );
  return contracts;
}

// Inspired by https://github.com/ejwessel/GanacheTimeTraveler/blob/master/utils.js
async function increaseTime(increase) {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://localhost:8545"
  );
  await provider.send("evm_increaseTime", [increase]);
}

async function takeSnapshot() {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://localhost:8545"
  );
  return await provider.send("evm_snapshot", []);
}

async function revertSnapshot(id) {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://localhost:8545"
  );
  await provider.send("evm_revert", [id]);
}

function toBinary(bn, bits = 256) {
  const hexString = bn.toHexString().substr(2);
  let result = "";
  for (let i = 0; i < hexString.length; i += 2) {
    const binary = parseInt(hexString.substring(i, i + 3), 16)
      .toString(2)
      .padStart(2, "0");
    result += binary;
  }
  return result.padStart(256, "0");
}

module.exports = {
  createBitmaps,
  deployAll,
  increaseTime,
  takeSnapshot,
  revertSnapshot,
  toBinary,
};
