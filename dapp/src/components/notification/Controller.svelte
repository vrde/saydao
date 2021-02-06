<script>
  import Widget from "./Widget.svelte";
  import { networkMismatch } from "src/state/eth";
</script>

{#if $networkMismatch}
<Widget level="error">
    Your wallet is connected to the <strong
      >{$networkMismatch.actual} network</strong
    >, please connect it to the
    <strong>{$networkMismatch.expected} network</strong>.
</Widget>
{/if}