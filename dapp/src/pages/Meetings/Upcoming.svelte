<script>
  import { upcomingMeetings } from "src/state/dao/poll";
  import DateTime from 'src/components/DateTime.svelte';
</script>

<h1>Upcoming events</h1>

{#each $upcomingMeetings as meeting}
<h2><a href="#/events/details/{meeting.id}">{meeting.title}</a></h2>
  <p>{meeting.question}</p>
<hr />
{:else}
  <h2>There are no upcoming events</h2>
  <a href="#/events/create">Propose an event</a>
{/each}
