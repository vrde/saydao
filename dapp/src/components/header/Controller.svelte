<script>
  import Widget from "./Widget.svelte";
  import { memberId } from "src/state/dao";
  import { me } from "src/state/dao/member";
  import CONFIG from "src/config";
</script>

<Widget
  name={CONFIG.name}
  role="member"
  balance={$me && $me.balance}
  shares={$me && $me.shares}
  memberId={$me && $memberId}
/>
