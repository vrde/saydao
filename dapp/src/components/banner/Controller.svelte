<script>
  import Widget from "./Widget.svelte";
  import { memberId } from "src/state/dao";
  import CONFIG from "src/config";
</script>

{#if !$memberId}
  <Widget name={CONFIG.name} />
{/if}
