#!/usr/bin/env node

require("dotenv").config();

const etherea = require("etherea");
const { build } = require("etherea/lib/solidity");

async function compile(outdir = "./dist") {
  const wallet = await etherea.wallet({
    endpoint: process.env.SAYDAO_ENDPOINT || "localhost",
    privateKey: process.env.SAYDAO_PRIVATE_KEY,
    mnemonic: process.env.SAYDAO_MNEMONIC
  });
  await build("./contracts/SayDAO.sol", outdir, wallet);
}

compile(process.argv[2]);
