<script>
import { wallet } from "src/state/eth"
import { parse } from 'qs'
import { querystring } from 'svelte-spa-router'
import { onMount } from 'svelte';

$: success = parse($querystring);
</script>

{#if $wallet && success}
  <h1>Welcome to ParTecK DAO!</h1>
  <p>You are registered as Member {success.memberId}!</p>
  <p>Go back to the <a href="#/">Home page</a> to start participating.</p>
  <details>
    <summary>
      Tell me more
    </summary>
    <p>
      Your membership has been recorded in the {$wallet.networkName} Ethereum
      blockchain, with the following transaction hash:
      <a href="https://{$wallet.networkName}.etherscan.io/tx/{success.tx}" target="_blank">{success.tx}</a>.
    </p>
  </details>
{/if}
