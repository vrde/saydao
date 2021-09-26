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
      transaction = await $wallet.contracts.SayDAO.recoverMember(
        invite.memberAddress,
        v,
        r,
        s
      );
      receipt = await $wallet.provider.waitForTransaction(transaction.hash);
    } catch (e) {
      state = "error";
      inviteError = e.toString();
      console.log(e);
      throw e;
    }
    await login();
    console.log(transaction);
    console.log(receipt);
    replace("/");
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
  {state}
  {txHash}
/>
