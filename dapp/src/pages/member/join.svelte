<script>
import etherea from "etherea";
import { login, wallet, role } from "src/state/eth"
import { parse } from 'qs'
import { querystring, replace } from 'svelte-spa-router'


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
  push('/');
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

  <h1>You have been invited to join ParTecK DAO!</h1>

  {#if !$wallet && etherea.hasNativeWallet()}

    <p>Your browser supports Ethereum, before you continue, you should log in.</p>

    {#if loginError}
      <p class="error">It didn't work out. Try again please.</p>
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

      <p>Please wait until your membership is stored in the DAO. This may require up to 15 seconds.</p>
    {:else if state === "error"}

      <p class="error">There was an error joining the DAO</p>
      <details>
        {inviteError}
      </details>

    {/if}

  {/if}

{/if}
