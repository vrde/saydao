<script>
  import Widget from "./Widget.svelte";
  export let list;
  export let highlightFirst = false;
  $: {
    console.log(list);
  }
</script>

{#if list}
  {#each list as meeting, i}
    <Widget
      id={meeting.id}
      title={meeting.title}
      question={meeting.question}
      meetingId={meeting.meetingId}
      meetingType={meeting.meetingType}
      meetingUrl={meeting.meetingUrl}
      meetingAddress={meeting.meetingAddress}
      meetingStart={meeting.meetingStart}
      meetingEnd={meeting.meetingEnd}
      meetingState={meeting.meetingState}
      highlight={highlightFirst && i === 0}
    />
  {/each}
{/if}
