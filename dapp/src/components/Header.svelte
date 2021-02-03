<script>
  import { networkMismatch } from "src/state/eth";
  import { role, memberId } from "src/state/dao";
  import CONFIG from "src/config";
</script>

{#if $networkMismatch}
  <p class="error">
    Your wallet is connected to the <strong
      >{$networkMismatch.actual} network</strong
    >, please connect it to the
    <strong>{$networkMismatch.expected} network</strong>.
  </p>
{/if}

<header role="banner">
  <div>
    <h1>
      <a href="#">{CONFIG.name}</a>
    </h1>

    {#if $memberId}
      <p>You are <strong>member {$memberId}</strong>.</p>
    {/if}
  </div>
</header>

<style>
  .error {
    background-color: #ffeb3b;
    text-align: center;
    margin: 0;
    padding: 10px;
  }
</style>
