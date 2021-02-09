#!/usr/bin/env node

require("dotenv").config();

const { readFile } = require("fs").promises;
const etherea = require("etherea");
const { build } = require("etherea/lib/solidity");

const NETWORK = process.env.NETWORK || "localhost";

console.log("Deploy to network", NETWORK);

function getEnv(key) {
  return process.env[`${NETWORK.toUpperCase()}_${key}`];
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
    endpoint: getEnv("ENDPOINT") || "localhost",
    privateKey: getEnv("PRIVATE_KEY"),
    mnemonic: getEnv("MNEMONIC"),
  });

  // Deploy the DAO
  const sayDaoContract = await build(
    "./contracts/SayDAO.sol",
    outdir,
    wallet,
    // min poll duration: one hour
    NETWORK === "localhost" ? 0 : 60 * 60,
    // min poll meeting duration: one week
    NETWORK === "localhost" ? 0 : 60 * 60 * 24 * 7,
    // time unit: one day
    NETWORK === "localhost" ? 1 : 60 * 60 * 24,
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
