<script>
  import { networkMismatch } from "src/state/eth";

  export let level = "warning"
</script>

{#if $networkMismatch}
  <p class="error">
    Your wallet is connected to the <strong
      >{$networkMismatch.actual} network</strong
    >, please connect it to the
    <strong>{$networkMismatch.expected} network</strong>.
  </p>
{/if}

<style>
  .error {
    background-color: #ffeb3b;
    text-align: center;
    margin: 0;
    padding: 10px;
  }
</style>