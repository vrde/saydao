<script>
  import { closed as polls } from "src/state/dao/poll";
  import DateTime from 'src/components/DateTime.svelte';
</script>

<h1>Closed Polls</h1>

{#if $polls}
  {#each $polls as poll}
  <h2><a href="#/polls/details/{poll.id}">{poll.title}</a></h2>
    <p><em>Voting closed on <DateTime date={poll.end} /></em></p>
  <hr />
  {:else}
    <h2>There are no closed polls</h2>
    <a href="#/polls/create">Create a poll</a>
  {/each}
{:else}
  loading...
{/if}
