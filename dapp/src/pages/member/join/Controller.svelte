<script>
  import Widget from "./Widget.svelte";
  import etherea, { hasNativeWallet } from "etherea";
  import { login, wallet } from "src/state/eth";
  import { memberId } from "src/state/dao";
  import { parse } from "qs";
  import { querystring, replace, push } from "svelte-spa-router";
  import CONFIG from "src/config";

  $: invite = parse($querystring);

  let state = "idle";
  let loginError;
  let inviteError;
  let loggedIn = false;
  let txHash;

  async function handleLogin() {
    loginError = false;
    try {
      await login();
      loggedIn = true;
    } catch (e) {
      console.log(e);
      loginError = true;
    }
  }

  async function handleSubmit() {
    state = "working";
    let transaction;
    let receipt;
    await login();
    try {
      const { r, s, v } = etherea.signature.split(invite.signature);
      console.log(r, s, v);
      transaction = await $wallet.contracts.SayDAO.join(
        invite.memberId,
        v,
        r,
        s
      );
      receipt = await $wallet.provider.waitForTransaction(transaction.hash);
    } catch (e) {
      state = "error";
      inviteError = e.toString();
      console.log(e);
    }
    await login();
    console.log(transaction);
    console.log(receipt);
    replace(
      `/member/welcome?memberId=${invite.memberId}&tx=${transaction.hash}`
    );
  }
</script>

<Widget
  {handleLogin}
  {handleSubmit}
  wallet={$wallet}
  memberId={$memberId}
  name={CONFIG.name}
  hasNativeWallet={etherea.hasNativeWallet()}
  {loggedIn}
  {loginError}
  {inviteError}
  inviteMemberId={invite.memberId}
  {state}
  {txHash}
/>
