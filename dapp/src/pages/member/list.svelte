<script>
  import { memberList } from "src/state/dao";
</script>
<h1>Members</h1>

{#if $memberList}
<ul>
  {#each $memberList as member}
  <li>
    #{member.memberId}: {member.balance} SAY tokens ({member.shares})
  </li>
  {/each}
</ul>
{:else}
  loading...
{/if}
