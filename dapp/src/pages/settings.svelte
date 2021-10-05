<script>
  import CONFIG from "src/config";
  import { wallet } from "src/state/eth";
  import { totalSay, prettyBalance } from "src/state/dao/member";

  let reveal = false;
  let checkLogout = false;
  function handleLogout() {
    localStorage.clear();
    window.location.href = "/";
  }
</script>

{#if $wallet}
  <section>
    <h1>Settings</h1>

    <p>Your account details can be viewed and changed here.</p>
  </section>
  {#if $wallet.mnemonic}
    <section>
      <h2>Magic Word Backup</h2>

      <p>
        <strong>Important!</strong> Make sure to save your
        <strong>12 magic words</strong> before you leave this page. You need these
        magic words to log in again. Write them down and keep them safe.
      </p>
      <p>Your 12 magic words are:</p>

      {#if reveal}
        <p>
          <button on:click={() => (reveal = false)}
            >Hide your 12 magic words</button
          >
        </p>
        <textarea readonly>{$wallet.mnemonic}</textarea>
      {:else}
        <button on:click={() => (reveal = true)}
          >Reveal your 12 magic words</button
        >
      {/if}
    </section>
  {/if}

  <section>
    <h2>Ethereum blockchain info</h2>
    <h3>Your Ethereum Address</h3>

    <p>{$wallet.address}</p>

    <h3>Smart Contracts Details</h3>

    <h4>{CONFIG.name} Address</h4>

    <p>
      The smart contract that runs {CONFIG.name} can be found at:
      <a
        href="https://{$wallet.networkName}.etherscan.io/address/{$wallet
          .contracts.SayDAO.address}"
        target="_blank">{$wallet.contracts.SayDAO.address}</a
      >.
    </p>

    <h4>Say Token Address</h4>

    <p>
      The smart contract that represents the Say token can be found at:
      <a
        href="https://{$wallet.networkName}.etherscan.io/address/{$wallet
          .contracts.SayToken.address}"
        target="_blank">{$wallet.contracts.SayToken.address}</a
      >.
    </p>

    <p>
      The total number of Say tokens is: <strong
        >{$totalSay && prettyBalance($totalSay)}</strong
      >
    </p>
  </section>

  <section>
    <h2>Software info</h2>

    <h3>Version</h3>

    <p>Built on: {CONFIG.date}</p>

    <h3>Source Code</h3>

    <p>
      <a href="https://github.com/vrde/saydao" target="_blank"
        >SayDAO source code</a
      >.
    </p>
  </section>

  {#if $wallet.mnemonic}
    <section>
      <h2>Logout</h2>
      <label
        ><input type="checkbox" bind:checked={checkLogout} /> I've saved my magic
        words</label
      >
      <br />
      <br />
      <button disabled={!checkLogout} on:click={handleLogout}>Logout</button>
    </section>
  {/if}
{:else}
  <h1>Forbidden!</h1>
  <p>You need to be logged in to see this page.</p>
{/if}
