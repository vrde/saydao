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
    // Addresse from https://docs.opengsn.org/gsn-provider/networks.html
    return "0x6453D37248Ab2C16eBd1A8f782a2CBC65860E60B";
  }
}

async function compile(outdir = "./dist") {
  const wallet = await etherea.wallet({
    endpoint: getEnv("ENDPOINT") || "localhost",
    privateKey: getEnv("PRIVATE_KEY"),
    mnemonic: getEnv("MNEMONIC"),
  });
  await build(
    "./contracts/SayDAO.sol",
    outdir,
    wallet,
    await getTrustedForwarder()
  );
}

compile(process.argv[2]);
