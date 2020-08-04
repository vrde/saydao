<script>
  import { pastMeetings, actionableMeetings } from "src/state/dao/poll";
  import DateTime from 'src/components/DateTime.svelte';
</script>

{#if $actionableMeetings.length}
<h1>Action required!</h1>

<p>You are the supervisor of the following meetings.<p>

{#each $actionableMeetings as meeting}
<h2><a href="#/events/details/{meeting.id}">{meeting.title}</a></h2>
  <p>{meeting.question}</p>
  <p><strong>Action:</strong> <a href="#/events/details/{meeting.id}">fill the participants list.</a></p>
<hr />
{/each}

{/if}

<h1>Past Events</h1>

{#each $pastMeetings as meeting}
<h2><a href="#/events/details/{meeting.id}">{meeting.title}</a></h2>
  <p>{meeting.question}</p>
<hr />
{:else}
  <h2>There are no past events</h2>
  <a href="#/events/create">Propose an Event</a>
{/each}
