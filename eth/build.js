#!/usr/bin/env node

const etherea = require("etherea");
const { build } = require("etherea/lib/solidity");

async function compile(outdir = "./dist") {
  const wallet = await etherea.getWallet({ endpoint: "http://localhost:8545" });
  await build("./contracts/SayDAO.sol", outdir, wallet);
}

compile(process.argv[2]);
