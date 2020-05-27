#!/usr/bin/env node

const etherea = require("etherea");
const { build } = require("etherea/lib/solidity");

async function compile() {
  const wallet = await etherea.getWallet("http://localhost:8545");
  await build("./contracts/SayDAO.sol", "./dist/", wallet);
}

compile();
