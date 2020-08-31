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
      set({
        owner: await contract.hasRole(defaultAdminRole, $wallet.address),
        member: (await contract.addressToMember($wallet.address)) !== 0
      });
    }
  },
  {}
);

export const totalMembers = derived(wallet, async ($wallet, set) => {
  if (!$wallet) return;
  const total = await $wallet.contracts.SayDAO.totalMembers();
  set(total.toNumber());
});

export const memberId = derived(wallet, async ($wallet, set) => {
  if (!$wallet) return;
  const id = await $wallet.contracts.SayDAO.addressToMember($wallet.address);
  console.log("member id is", id);
  set(id !== 0 ? id : null);
});

export const rawBalance = derived(
  [wallet, memberId],
  async ([$wallet, $memberId], set) => {
    if (!$wallet || $memberId === undefined) return;
    const value = await $wallet.contracts.SayToken.balanceOf($wallet.address);
    const decimals = await $wallet.contracts.SayToken.decimals();
    const total = await $wallet.contracts.SayToken.totalSupply();
    set({ value, decimals, total });
  }
);

export const balance = derived(
  rawBalance,
  $rawBalance => $rawBalance && prettyBalance($rawBalance)
);

export const totalSupply = derived(
  rawBalance,
  $rawBalance =>
    $rawBalance &&
    $rawBalance.total
      .div(etherea.BigNumber.from(10).pow($rawBalance.decimals))
      .toString()
);

export const shares = derived(
  rawBalance,
  $rawBalance => $rawBalance && prettyShares($rawBalance)
);
