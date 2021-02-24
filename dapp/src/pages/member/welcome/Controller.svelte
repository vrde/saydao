<script>
  import Widget from "./Widget.svelte";
  import { wallet } from "src/state/eth";
  import { parse } from "qs";
  import { querystring } from "svelte-spa-router";
  import CONFIG from "src/config";

  let success = {};
  $: success = parse($querystring);
</script>

<Widget
  wallet={$wallet}
  name={CONFIG.name}
  memberId={success.memberId}
  txHash={success.tx}
  networkName={$wallet && $wallet.networkName}
/>
