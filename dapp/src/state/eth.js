import db from "./db";
import ethers from "ethers";
import erc20ABI from "../contracts/erc20.abi.json";
import { writable, derived } from "svelte/store";
import { clock } from "./clock";
import { get } from "svelte/store";
import etherea from "etherea";

export async function authenticate() {
  const w = await etherea.wallet();
  wallet.set(w);
  console.log("wallet", w);
  return w;
}

export async function sign(message) {
  const p = get(provider);
  console.log("provider", p);
  return await p.getSigner().signMessage(message);
}

export const provider = writable(undefined, set => {
  console.log(
    "set",
    window.ethereum,
    window.ethereum && window.ethereum.selectedAddress
  );
  if (window.ethereum && window.ethereum.selectedAddress) {
    set(new ethers.providers.Web3Provider(window.ethereum));
  }
  return _ => 0;
});

export const wallet = writable();

export const address = derived(
  [provider, clock],
  async ([$provider, $clock], set) => {
    if ($provider) {
      const accounts = await $provider.listAccounts();
      set(accounts[0]);
    }
  }
);

export const addressShort = derived(address, async ($address, set) => {
  if ($address) {
    set($address.substr(0, 6) + "…" + $address.substr(-4));
  }
});

export const contributors = derived(
  [provider, address],
  async ([$provider, $address], set) => {
    if ($provider && $address) {
      const contractAddress = "";
      const holders = {};
      const contract = new ethers.Contract(
        contractAddress,
        erc20ABI,
        $provider
      );
      const parsed = {};
      for (let holderAddress of Object.keys(holders)) {
        parsed[holderAddress] = {
          balance: (await contract.balanceOf(holderAddress))
            .toString()
            .slice(0, -18),
          name: holders[holderAddress]
        };
      }
      set(parsed);
    }
  }
);
