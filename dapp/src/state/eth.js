import { writable, derived } from "svelte/store";
import { get } from "svelte/store";

import etherea from "etherea";

import contracts from "../contracts/contracts.json";
import CONFIG from "../config";
import db from "./db";
import { clock } from "./clock";

// Autologin
(() => db.get("saydao:autologin") && login())();

export async function login(mnemonic) {
  let w;
  if (etherea.hasNativeWallet()) {
    try {
      w = await etherea.getNativeWallet(CONFIG.walletOptions);
      networkMismatch.set();
    } catch (e) {
      if (e instanceof etherea.exceptions.NetworkMismatch) {
        // Try again when user changes network
        db.set("saydao:autologin", true);
        console.error(e.message);
        networkMismatch.set(e);
        return;
      }
    }
  } else {
    w = await etherea.getLocalWallet({
      ...CONFIG.walletOptions,
      mnemonic: mnemonic || db.get("saydao:wallet:mnemonic")
    });
  }
  w.loadContracts(contracts);
  db.set("saydao:wallet:mnemonic", w.mnemonic);
  db.set("saydao:autologin", true);
  console.log("User authenticated with wallet", w);
  window.wallet = w;
  wallet.set(w);
  return w;
}

export async function logout() {
  db.clear();
  wallet.set(undefined);
}

export const networkMismatch = writable();

export const wallet = writable();

export const addressShort = derived(wallet, async ($wallet, set) => {
  if ($wallet) {
    set($wallet.address.substr(0, 6) + "…" + $wallet.address.substr(-4));
  }
});
