<script>
  import { list as members } from "src/state/dao/member";
</script>

<section>
  <h1>Members</h1>

  {#if $members}
    <ul>
      {#each $members as member}
        <li>
          #{member.id}: {member.balance} SAY tokens ({member.shares})
        </li>
      {/each}
    </ul>
  {:else}
    loading...
  {/if}
</section>
