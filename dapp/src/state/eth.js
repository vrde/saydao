import { writable, derived } from "svelte/store";
import { get } from "svelte/store";

import etherea from "etherea";

import contracts from "../contracts/contracts.json";
import CONFIG from "../config";
import db from "./db";
import { clock } from "./clock";

// Autologin
(() => db.get("saydao:logged") && authenticate())();

export async function authenticate(mnemonic) {
  const options = {
    ...CONFIG.walletOptions,
    mnemonic
  };
  console.log("wallet options", options);
  let w;
  if (etherea.hasNativeWallet()) {
    w = await etherea.getNativeWallet(options);
  } else {
    w = await etherea.getLocalWallet(options);
  }
  w.loadContracts(contracts);
  wallet.set(w);
  window.wallet = w;
  console.log("User authenticated with wallet", w);
  db.set("saydao:logged", true);
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
