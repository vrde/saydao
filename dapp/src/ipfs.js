import * as cache from "src/cache";
import CONFIG from "src/config";
import baseX from "base-x";
const bs58 = baseX(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
);

// FIXME: should not use an object from window
const client = IpfsHttpClient(CONFIG.ipfsEndpoint);

// Upload to IPFS and get the CID
export async function add(data) {
  let cid;
  try {
    const added = await client.add(JSON.stringify(data));
    cid = added.cid.toString();
    await client.pin.add(added.cid);
    console.log("Content uploaded and pinned to IPFS with cid", cid);
  } catch (err) {
    console.error(err);
    return;
  }
  cache.set(cid, data);
  return cid;
}

// This works for JSON only
async function _get(cid) {
  let data = new Uint8Array();
  let dataRead = 0;
  const chunks = [];
  console.log("IPFS: fetch", cid);
  for await (const chunk of client.cat(cid)) {
    chunks.push(chunk);
    const tmp = new Uint8Array(data.byteLength + chunk.byteLength);
    tmp.set(chunk, data.byteLength);
    data = tmp;
    dataRead += chunk.byteLength;
  }
  const raw = new TextDecoder("utf-8").decode(data);
  const content = JSON.parse(raw);
  return content;
}

export const get = cache.wrap(_get);

// FIXME: make sure it's future proof
export function cidToUint(cid) {
  return (
    "0x" +
    bs58
      .decode(cid)
      .toString("hex")
      .substr(4)
  );
}

export function uintToCid(uint) {
  return bs58.encode(Buffer.from("1220" + uint.substr(2), "hex"));
}
