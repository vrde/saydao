<script>
  import Widget from "./Widget.svelte";
  import { wallet } from "src/state/eth";
  import { get as getPoll } from "src/state/dao/poll";
  export let params = null;

  let state = {};
  let poll = getPoll(params.id);

  $: {
    poll = getPoll(params.id);
  }

  async function handleSubmit(vote) {
    state.action = "submit";
    try {
      await $wallet.contracts.SayDAO.vote($poll.id, vote);
      state = {};
    } catch (e) {
      console.error(e);
      state.error = e.toString();
    }
  }
</script>

{#if $poll}
  <Widget
    id={$poll.id}
    title={$poll.title}
    question={$poll.question}
    choices={$poll.choices}
    end={$poll.end}
    hasVotedFor={$poll.hasVotedFor}
    hasTokens={$poll.hasTokens}
    votesPerc={$poll.votesPerc}
    open={$poll.open}
    totalVotesPerc={$poll.totalVotesPerc}
    finalDecision={$poll.finalDecision}
    quorumReached={$poll.quorumReached}
    toQuorum={$poll.toQuorum}
    isMeeting={$poll.isMeeting}
    meetingType={$poll.meetingType}
    meetingUrl={$poll.meetingUrl}
    meetingAddress={$poll.meetingAddress}
    meetingStart={$poll.meetingStart}
    meetingEnd={$poll.meetingEnd}
    meetingSupervisor={$poll.meetingSupervisor}
    {handleSubmit}
  />
{/if}
