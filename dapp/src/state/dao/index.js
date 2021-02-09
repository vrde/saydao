import { derived } from "svelte/store";
import etherea from "etherea";
import { wallet } from "src/state/eth";

function prettyBalance(raw) {
  return raw.value.div(etherea.BigNumber.from(10).pow(raw.decimals)).toString();
}

function prettyShares(raw) {
  const factor = etherea.BigNumber.from(1000);
  const owned = raw.value.mul(factor);
  // This is a bit redundant, but hey.
  const perc =
    raw.total > 0 ? (100 * owned.div(raw.total).toNumber()) / 1000 : 0;
  return perc.toString() + "%";
}

export async function invite(wallet, memberId) {
  const contractAddress = wallet.contracts.SayDAO.address.toLowerCase();
  const message = `Member: ${memberId}\nContract: ${contractAddress}`;
  const invite = await wallet.signMessage(message);
  return invite;
}

export const role = derived(
  wallet,
  async ($wallet, set) => {
    if ($wallet) {
      const contract = $wallet.contracts.SayDAO;
      const defaultAdminRole = await contract.DEFAULT_ADMIN_ROLE();
      const managerRole = await contract.MANAGER_ROLE();
      set({
        admin: await contract.hasRole(defaultAdminRole, $wallet.address),
        manager: await contract.hasRole(managerRole, $wallet.address),
        member: (await contract.addressToMember($wallet.address)) !== 0,
      });
    }
  },
  {}
);

export const memberId = derived(wallet, async ($wallet, set) => {
  if (!$wallet) return;
  const id = await $wallet.contracts.SayDAO.addressToMember($wallet.address);
  console.log("member id is", id);
  set(id !== 0 ? id : null);
});

export const minPollDuration = derived(wallet, async ($wallet, set) => {
  if ($wallet) {
    const v = await $wallet.contracts.SayDAO.minPollDuration();
    set(v);
  } else {
    set(undefined);
  }
});

export const minPollMeetingDuration = derived(wallet, async ($wallet, set) => {
  if ($wallet) {
    const v = await $wallet.contracts.SayDAO.minPollMeetingDuration();
    set(v);
  } else {
    set(undefined);
  }
});

const DURATIONS = [
  [60, "1 minute"],
  [60 * 10, "10 minutes"],
  [60 * 60, "1 hour"],
  [60 * 60 * 24, "1 day"],
  [60 * 60 * 24 * 7, "7 days"],
  [60 * 60 * 24 * 30, "30 days"],
];

export const pollDurations = derived(minPollDuration, (m) => {
  return DURATIONS.filter((d) => d[0] >= m);
});

export const pollMeetingDurations = derived(minPollMeetingDuration, (m) => {
  return DURATIONS.filter((d) => d[0] >= m);
});
