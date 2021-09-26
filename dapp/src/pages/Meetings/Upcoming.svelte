<script>
  import { upcomingMeetings } from "src/state/dao/poll";
  import Meetings from "src/components/meeting";
</script>

<section>
  <h1>Upcoming events</h1>
</section>

{#if $upcomingMeetings}
  <Meetings list={$upcomingMeetings} highlightFirst={true} />
{:else}
  <section>There are no upcoming events.</section>
{/if}
