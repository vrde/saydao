import { writable, derived } from "svelte/store";
import { get } from "svelte/store";

import etherea from "etherea";

import contracts from "../contracts/contracts.json";
import CONFIG from "../config";
import db from "./db";
import { clock } from "./clock";

export async function authenticate() {
  const w = await etherea.wallet(CONFIG.walletOptions);
  w.loadContracts(contracts);
  wallet.set(w);
  console.log("User authenticated with wallet", w);
  return w;
}

export const wallet = writable();

export const role = derived(wallet, async ($wallet, set) => {
  if ($wallet) {
    if ((await $wallet.contracts.SayDAO.owner()) === $wallet.address) {
      set("owner");
    } else {
      set("anon");
    }
  }
});

export const addressShort = derived(wallet, async ($wallet, set) => {
  if ($wallet) {
    set($wallet.address.substr(0, 6) + "…" + $wallet.address.substr(-4));
  }
});
