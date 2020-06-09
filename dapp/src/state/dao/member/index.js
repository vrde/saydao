import etherea from "etherea";

export async function invite(wallet, memberId) {
  return await wallet.signMessage(etherea.to.array.uint16(memberId));
}
