<script>
import etherea from "etherea";
import { login, wallet } from "src/state/eth"
import { role } from "src/state/dao"
import { parse } from 'qs'
import { querystring, replace, push } from 'svelte-spa-router'


$: invite = parse($querystring);

let state = "idle";
let loginError;
let inviteError;

async function handleLogin() {
  loginError = false;
  try {
    await login();
  } catch(e) {
    console.log(e);
    loginError = true;
  }
}

async function handleSubmit() {
  state = 'working';
  let transaction;
  let receipt;
  await login();
  try {
    const { r, s, v} = etherea.signature.split(invite.signature);
    console.log(r, s, v);
    transaction = await $wallet.contracts.SayDAO.join(invite.memberId, v, r, s);
    receipt = await $wallet.provider.waitForTransaction(transaction.hash);
  } catch(e) {
    state = 'error';
    inviteError = e;
    console.log(e);
  }
  console.log(transaction);
  console.log(receipt);
  replace(`/member/welcome?memberId=${invite.memberId}&tx=${transaction.hash}`);
  //const transaction = await $wallet.contracts.SayDAO.foo();
  //hash = transaction.hash;
  //console.log('transaction hash is', transaction.hash);
  //const receipt = await $wallet.provider.waitForTransaction(transaction.hash);
  //blockNumber = receipt.blockNumber;
  //console.log(`Mined in block: ${receipt.blockNumber}`);
}
</script>

{#if $wallet && $role.member}

  <h1>Error</h1>
  <p>You are already a member of the DAO</p>

{:else}

  <h1>Welcome! You have been invited to join ParTecK DAO.</h1>

  {#if !$wallet && etherea.hasNativeWallet()}

    <p>Your browser supports Ethereum. Before you continue, you should log in to your Ethereum account.</p>

    {#if loginError}
      <p class="error">That didn't work. Please try again.</p>
    {/if}

    <ul>
      <li>
        <button on:click={handleLogin} href="#">Log in with your Ethereum account</button>
      </li>
    </ul>

  {:else}

    <form on:submit|preventDefault={handleSubmit}>
      <p>I want to join ParTecK DAO with <strong>Member ID {invite.memberId}</strong>.</p>
      <button disabled={state!=="idle"} type="submit">Confirm</button>
    </form>

    {#if state === "working"}

      <p>Please wait while your membership is created. This may take up to 30 seconds. Be patient!</p>

    {:else if state === "error"}

      <p class="error">There was an error joining the DAO. Please try again. If this is the second time you've tried, please contact the person who invited you.</p>
      <details>
        {inviteError.toString()}
      </details>

    {/if}

  {/if}

{/if}
