const IpfsHttpClient = require("ipfs-http-client");
const { globSource } = IpfsHttpClient;

//const IPFS_PROTOCOL = process.env["IPFS_PROTOCOL"] || "https";
//const IPFS_HOST = process.env["IPFS_HOST"] || "ipfs.infura.io";
//const IPFS_PORT = process.env["IPFS_PORT"] || "5001";

const ipfs = IpfsHttpClient(/*{
  host: IPFS_HOST,
  port: IPFS_PORT,
  protocol: IPFS_PROTOCOL
}*/);

async function main() {
  for await (const file of ipfs.add(
    globSource("./build", { recursive: true })
  )) {
    console.log(file);
  }
}

main();
