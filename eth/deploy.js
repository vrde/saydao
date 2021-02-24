#!/usr/bin/env node

require("dotenv").config();

const { readFile } = require("fs").promises;
const etherea = require("etherea");
const { build } = require("etherea/lib/solidity");

const NETWORK = process.env.NETWORK || "localhost";

console.log("Deploy to network", NETWORK);

function getEnv(key, fallback) {
  const v = process.env[`${NETWORK.toUpperCase()}_${key}`];
  if (v === undefined || v === null) {
    if (fallback === undefined) {
      throw new Error("Cannot find required key", key);
    } else {
      return fallback;
    }
  }
  return v;
}

async function getTrustedForwarder() {
  if (NETWORK === "localhost") {
    return JSON.parse(await readFile("./gsn.json"))["forwarderAddress"];
  } else if (NETWORK === "kovan") {
    // Address from https://docs.opengsn.org/gsn-provider/networks.html
    return "0x0842Ad6B8cb64364761C7c170D0002CC56b1c498";
  }
}

async function compile(outdir = "./dist") {
  const wallet = await etherea.wallet({
    endpoint: getEnv("ENDPOINT", "localhost"),
    privateKey: getEnv("PRIVATE_KEY"),
    mnemonic: getEnv("MNEMONIC"),
  });

  // Deploy the DAO
  const sayDaoContract = await build(
    "./contracts/SayDAO.sol",
    outdir,
    wallet,
    // min poll duration: one hour
    getEnv("MIN_POLL_DURATION"),
    // min poll meeting duration: one week
    getEnv("MIN_POLL_MEETING_DURATION"),
    // time unit: one day
    getEnv("TIME_UNIT"),
    await getTrustedForwarder()
  );

  // FIXME: etherea
  delete sayDaoContract["SayToken"];
  wallet.loadContracts(sayDaoContract);

  // Deploy the token and specify who is the minter (the DAO)
  const sayTokenContract = await build(
    "./contracts/SayToken.sol",
    outdir,
    wallet,
    wallet.contracts.SayDAO.address
  );

  wallet.loadContracts({ ...sayDaoContract, ...sayTokenContract });

  // Update the DAO so it knows which token to use
  await wallet.contracts.SayDAO.setTokenAddress(
    wallet.contracts.SayToken.address
  );
}

compile(process.argv[2]);
