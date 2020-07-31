<script>
  import { pollList } from "src/state/dao/poll";
</script>

<h1>Open Polls</h1>

{#each $pollList as poll}
<h2><a href="#/polls/details/{poll.id}">{poll.title}</a></h2>
<p><em>Voting closes on {poll.end}</em></p>
<p>{poll.question}</p>
<hr />
{/each}

<h2>Descriptive title of poll (i.e. Who should speak at our next event)</h2>
<p>Voting closes on DATE, 2020 at 11:59:59 pm.
<p>Quorum has been reached / X more votes are needed for a quorum.
<p>Body of the poll (i.e. There will be an event on July 1, 2020. Which of the following speakers should give a talk?)</p>

<ul>
  <li>Option 1: 80% <button>Vote for this</button> </li>
  <li>Option 2: 20% <button>Vote for this</button> </li>
</ul>

<hr>

<h2>Descriptive title of second poll</h2>
<p>Voting closes on DATE, 2020 at 11:59:59 pm.
<p>Quorum has been reached / X more votes are needed for a quorum.
<p>Body of the poll</p>

<ul>
  <li>Option 1: 80% <button>Vote for this</button> </li>
  <li>Option 2: 20% <button>Vote for this</button> </li>
</ul>
