<script>
  import { upcomingMeetings } from "src/state/dao/poll";
  import Meetings from "src/components/meeting";
</script>

<section>
  <h1>Upcoming events</h1>
</section>

<Meetings list={$upcomingMeetings && $upcomingMeetings} highlightFirst={true} />
