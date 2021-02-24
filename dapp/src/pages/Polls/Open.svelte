<script>
  import { open as polls } from "src/state/dao/poll";
  import DateTime from "src/components/DateTime.svelte";
</script>

<section>
  <h1>Open polls</h1>

  {#if $polls}
    {#each $polls as poll}
      <h2><a href="#/polls/details/{poll.id}">{poll.title}</a></h2>
      <p><em>Voting closes on <DateTime date={poll.end} /></em></p>
      <hr />
    {:else}
      <h2>There are no open polls</h2>
      <a href="#/polls/create">Create a poll</a>
    {/each}
  {:else}
    loading...
  {/if}
</section>
