<script>
import etherea from "etherea";
import { authenticate, wallet } from "src/state/eth"
import { parse } from 'qs'
import {querystring} from 'svelte-spa-router'

$: invite = parse($querystring);

let state = "idle";
let hash;
let blockNumber;

async function handleSubmit() {
  await authenticate();
  //const { r, s, v} = etherea.signature.split(invite.signature);
  //console.log(r, s, v);
  //const transaction = await $wallet.contracts.SayDAO.join(invite.memberId, v, r, s);
  const transaction = await $wallet.contracts.SayDAO.foo();
  hash = transaction.hash;
  console.log('transaction hash is', transaction.hash);
  const receipt = await $wallet.provider.waitForTransaction(transaction.hash);
  blockNumber = receipt.blockNumber;
  console.log(`Mined in block: ${receipt.blockNumber}`);
}
</script>

<h1>You have been invited to join ParTecK DAO!</h1>

<p>Hi! Someone invited you to join.</p>

<p>Hash: {hash}</p>
<p>Block Number: {blockNumber}</p>

<form on:submit|preventDefault={handleSubmit}>
  <p>I want to join ParTecK DAO with <strong>Member ID {invite.memberId}</strong>.</p>
  <button type="submit">Confirm</button>
</form>
