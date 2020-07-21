<script>
  import CONFIG from "src/config";
  import { wallet } from "../state/eth";
</script>

{#if $wallet}
<section>

    <h2>Settings</h2>

    <p>Here you can find all the details about your account.</p>

    {#if $wallet.mnemonic}
    <h3>Backup</h3>

    <p>
      Important! You should save somewhere your personal <strong>12 magic words</strong>. Those 12 magic words will allow to log in again. If you lose them, you will have to recover your account and it might take some time.
    </p>
    <p>Your 12 magic words are:</p>

    <textarea readonly>{$wallet.mnemonic}</textarea>
    {/if}

    <h3>Your Ethereum Address</h3>

    <p>{$wallet.address}</p>

    <h3>SayDAO Address</h3>

    <p>The smart contract that regulates participation to the DAO can be found at
      <a href="https://{$wallet.networkName}.etherscan.io/address/{$wallet.contracts.SayDAO.address}" target="_blank">{$wallet.contracts.SayDAO.address}</a>.
    </p>

    <h3>Version</h3>

    <p>Built on: {CONFIG.date}</p>

    <h3>Source Code</h3>

    <p><a href="https://github.com/vrde/saydao" target="_blank">SayDAO source code</a>.</p>

</section>

{:else}
  <h1>Forbidden!</h1>
  <p>You need to be logged in to see this page</p>
{/if}
