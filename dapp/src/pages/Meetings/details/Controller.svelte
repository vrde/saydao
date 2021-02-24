<script>
  import Widget from "./Widget.svelte";
  import { get as getPoll } from "src/state/dao/poll";
  export let params = null;

  let poll = getPoll(params.id);

  $: {
    poll = getPoll(params.id);
  }
</script>

{#if $poll}
  <Widget
    id={$poll.id}
    title={$poll.title}
    question={$poll.question}
    open={$poll.open}
    meetingId={$poll.meetingId}
    meetingType={$poll.meetingType}
    meetingUrl={$poll.meetingUrl}
    meetingAddress={$poll.meetingAddress}
    meetingStart={$poll.meetingStart}
    meetingEnd={$poll.meetingEnd}
    meetingState={$poll.meetingState}
    meetingValid={$poll.meetingValid}
    actionRequired={$poll.actionRequired}
  />
{/if}
