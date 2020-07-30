import { derived } from "svelte/store";
import etherea from "etherea";
import { wallet } from "src/state/eth";

export async function invite(wallet, memberId) {
  return await wallet.signMessage(etherea.to.array.uint16(memberId));
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

export const memberId = derived(wallet, async ($wallet, set) => {
  if (!$wallet) return;
  const id = await $wallet.contracts.SayDAO.addressToMember($wallet.address);
  set(id !== 0 ? id : null);
});

export const rawBalance = derived(
  [wallet, memberId],
  async ([$wallet, $memberId], set) => {
    if (!$wallet || !$memberId) return;
    //const value = await $wallet.contracts.SayToken.balanceOf($memberId);
    const value = await $wallet.contracts.SayToken.balanceOf($wallet.address);
    const decimals = await $wallet.contracts.SayToken.decimals();
    const total = await $wallet.contracts.SayToken.totalSupply();
    set({ value, decimals, total });
  }
);

export const balance = derived(
  rawBalance,
  $rawBalance =>
    $rawBalance &&
    $rawBalance.value
      .div(etherea.BigNumber.from(10).pow($rawBalance.decimals))
      .toString()
);

export const totalSupply = derived(
  rawBalance,
  $rawBalance =>
    $rawBalance &&
    $rawBalance.total
      .div(etherea.BigNumber.from(10).pow($rawBalance.decimals))
      .toString()
);

export const shares = derived(rawBalance, $rawBalance => {
  if (!$rawBalance) return;
  const factor = etherea.BigNumber.from(1000);
  const owned = $rawBalance.value.mul(factor);
  // This is a bit redundant, but hey.
  const perc = (100 * owned.div($rawBalance.total).toNumber()) / 1000;
  return perc.toString() + "%";
});
