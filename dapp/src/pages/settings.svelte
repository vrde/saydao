<script>
  import CONFIG from "src/config";
  import { wallet } from "src/state/eth";
  import { totalSupply } from "src/state/dao";
</script>

{#if $wallet}
<section>

    {#if $wallet.mnemonic}
  <h2>Magic Word Backup</h2>


    <h3>Magic Word Backup</h3>

    <p>
      <strong>Important!</strong> Make sure to save your <strong>12 magic words</strong> before leaving this page.You will need these magic words to log in again.  Write them down and keep them safe.</p>
    <p>Your 12 magic words are:</p>

    <textarea readonly>{$wallet.mnemonic}</textarea>
    {/if}

    <h2>Settings</h2>

    <p>Your account details can be viewed and changed here.</p>

    <h3>Your Ethereum Address</h3>

    <p>{$wallet.address}</p>

    <h3>Smart Contracts Details</h3>

    <h4>SayDAO Address</h4>

    <p>The smart contract that regulates participation to the DAO can be found at
      <a href="https://{$wallet.networkName}.etherscan.io/address/{$wallet.contracts.SayDAO.address}" target="_blank">{$wallet.contracts.SayDAO.address}</a>.
    </p>

    <h4>SayToken Address</h4>

    <p>The smart contract that represents the token can be found at
      <a href="https://{$wallet.networkName}.etherscan.io/address/{$wallet.contracts.SayToken.address}" target="_blank">{$wallet.contracts.SayToken.address}</a>.
    </p>

    <p>
      The total amount of SayTokens is <strong>{$totalSupply}</strong>.
    </p>

    <h3>Version</h3>

    <p>Built on: {CONFIG.date}</p>

    <h3>Source Code</h3>

    <p><a href="https://github.com/vrde/saydao" target="_blank">SayDAO source code</a>.</p>

</section>

{:else}
  <h1>Forbidden!</h1>
  <p>You need to be logged in to see this page.</p>
{/if}
