#!/usr/bin/env node

const { dirname } = require("path");
const { writeFile } = require("fs").promises;
const { mkdir } = require("fs").promises;
const ganache = require("ganache-core");
const gsnTestEnv = require("@opengsn/gsn/dist/GsnTestEnvironment").default;

const outfile = process.argv[2] || "gsn.json";
const outdir = dirname(outfile);

async function startGanache() {
  const server = ganache.server();
  const provider = server.provider;
  return new Promise((resolve, reject) => {
    server.listen(8545, function (err, blockchain) {
      if (err) {
        reject(err);
      } else {
        resolve(blockchain);
      }
    });
  });
}

async function startGsn() {
  await mkdir(outdir, { recursive: true });
  const gsnInstance = await gsnTestEnv.startGsn("localhost");
  await writeFile(
    outfile,
    JSON.stringify(gsnInstance.deploymentResult, null, 2)
  );
  return gsnInstance.deploymentResult;
}

async function start() {
  console.log("Start ganache server");
  const blockchain = await startGanache();
  console.log("Mnemonic:", blockchain.mnemonic);
  console.log("Start Gas Station Relay");
  const gsn = await startGsn();
  console.log("GSN configuration", gsn);
}

start();
