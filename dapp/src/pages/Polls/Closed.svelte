<script>
  import { closedPolls } from "src/state/dao/poll";
  import DateTime from 'src/components/DateTime.svelte';
</script>

<h1>Closed Polls</h1>

{#each $closedPolls as poll}
<h2><a href="#/polls/details/{poll.id}">{poll.title}</a></h2>
  <p><em>Voting closed on <DateTime date={poll.end} /></em></p>
  <p>{poll.question}</p>
<hr />
{:else}
  <h2>There are no closed polls</h2>
  <a href="#/polls/create">Create a poll</a>
{/each}
