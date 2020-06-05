import db from "./db";
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

export const wallet = writable();

export const addressShort = derived(wallet, async ($wallet, set) => {
  if ($wallet) {
    set($wallet.address.substr(0, 6) + "…" + $wallet.address.substr(-4));
  }
});
