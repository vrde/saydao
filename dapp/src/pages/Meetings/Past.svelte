<script>
  import { pastMeetings, actionableMeetings } from "src/state/dao/poll";
  import DateTime from 'src/components/DateTime.svelte';
</script>

{#if $actionableMeetings && $actionableMeetings.length}
<h1>Action required</h1>

<p>You are the supervisor of the following events:<p>

{#each $actionableMeetings as meeting}
<h2><a href="#/events/details/{meeting.id}">{meeting.title}</a></h2>
  <p>{meeting.question}</p>
  <p><strong>Action:</strong> <a href="#/events/details/{meeting.id}">Please fill in the list of participants.</a></p>
<hr />
{/each}

{/if}

<h1>Past events</h1>

{#if $pastMeetings}
  {#each $pastMeetings as meeting}
  <h2><a href="#/events/details/{meeting.id}">{meeting.title}</a></h2>
  <p>
    The event happened between
    <DateTime date={meeting.meetingStart} />
    and
    <DateTime date={meeting.meetingEnd} />.
  </p>
  <p>{meeting.question}</p>
  <hr />
  {:else}
    <h2>There are no past events</h2>
    <a href="#/events/create">Propose an event</a>
  {/each}
{:else}
  loading...
{/if}
