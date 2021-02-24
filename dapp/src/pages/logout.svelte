<script>
  import { push } from "svelte-spa-router";
  import { logout, wallet } from "../state/eth";
  import CONFIG from "src/config";
</script>

<section>
  <div>
    <h2>Sign out</h2>

    {#if $wallet && $wallet.mnemonic}
      <p>
        <strong>PLEASE NOTE:</strong> If you sign out, you will need your
        <strong>12 magic words</strong> to log in again. If you don't have your
        magic words, you won't be able to use {CONFIG.name}. Your account can be
        restored, but it might be a slow process.
      </p>

      <p>Your 12 magic words are:</p>

      <textarea readonly>{$wallet.mnemonic}</textarea>
    {/if}

    <p>Are you sure you want to sign out?</p>

    <button on:click={() => logout() && push("/")}> Sign out </button>
  </div>
</section>
