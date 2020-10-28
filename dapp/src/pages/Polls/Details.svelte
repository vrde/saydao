<script>
  import DOMPurify from "dompurify";
  import marked from "marked";
  import DateTime from 'src/components/DateTime.svelte';
  import { wallet } from 'src/state/eth';
  import { get as getPoll } from 'src/state/dao/poll';
  import { location } from 'svelte-spa-router';
  import Loading from "src/components/Loading.svelte";
  export let params = null;

  let vote = null;
  let state = {};
  let poll = getPoll(params.id);

  $: {
    poll = getPoll(params.id);
  }

  function handleClose() {
    state = {};
  }

  async function handleSubmit() {
    state.action = "submit";
    try {
      await $wallet.contracts.SayDAO.vote($poll.id, vote);
      state = {}
    } catch(e) {
      console.error(e);
      state.error = e.toString();
    }
  }

</script>

<style>
  label {
    padding: var(--size-xs) var(--size-s);
    border: 2px solid transparent;
  }

  input {
    width: var(--size-s);
    height: var(--size-s);
    vertical-align: bottom;
  }

  label.active {
    border: 2px solid black;
  }

  fieldset {
    background-color: white;
  }

  button {
    width: 100%;
  }

  li p {
    margin: 0;
  }

  .question {
    font-size: 1.5rem;
  }

  .details p {
    margin: 0;
  }

</style>

<Loading {state} onClose={handleClose}/>

{#if $poll}
  {#if $poll.open}
    <div class="details">
      <p>
        <strong>{$poll.totalVotesPerc}%</strong> of ParTecK DAO voted on this poll.
        {#if $poll.quorumReached}
          <strong>Quorum has been reached</strong>.
        {:else}
          <strong>{$poll.toQuorum}%</strong> more votes are needed for a quorum.
        {/if}
      </p>
      <p><em>Voting closes on <DateTime date={$poll.end} countdown={true} /></em></p>
    </div>
  {:else}
    <div class="details">
      <p>
        <strong>{$poll.totalVotesPerc}%</strong> of the DAO voted on this poll.
        {#if $poll.quorumReached}
          <strong>Quorum has been reached</strong>.
        {:else}
          <strong>Quorum has not been reached</strong>.
        {/if}
      </p>
      <p><em>Voting ended on <DateTime date={$poll.end} /></em></p>
    </div>
  {/if}

  <hr />

  <h1>{$poll.title}</h1>
  <div class="question">
    {@html DOMPurify.sanitize(marked($poll.question))}
  </div>

  {#if $poll.isMeeting}
  <p>
    The event will happen between
    <DateTime date={$poll.meetingStart} />
    and
    <DateTime date={$poll.meetingEnd} />.
  </p>
  <p>
    The supervisor is <strong>member #{$poll.meetingSupervisor}</strong>.
  </p>
  {/if}
  {#if $poll.hasVotedFor === null && $poll.open && $poll.hasTokens}
    <form on:submit|preventDefault={handleSubmit}>
      <fieldset disabled={$poll.hasVotedFor}>
      {#if $poll.isMeeting}
      <legend>Do you want to approve this Event?</legend>
        {:else}
      <legend>Make your choice</legend>
      {/if}
        {#each $poll.choices as choice, i}
          <label class:active={vote===i}>
            <input type="radio" bind:group={vote} value={i} />
            {choice}
          </label>
        {/each}
        <button disabled={vote===null}>Vote!</button>
      </fieldset>
    </form>
  {:else}
    <ol>
      {#each $poll.choices as choice, i}
        <li>
          <p><strong>{choice}</strong></p>
          <p>
            Votes: {$poll.votesPerc[i]}%
            {#if $poll.hasVotedFor === i}
              (You voted for this)
            {/if}
          </p>
        </li>
      {/each}
    </ol>
    {#if $poll.open && $poll.hasTokens === null}
    <p><strong>Note:</strong> you can't vote on this poll because you joined ParTecK DAO after the poll was created.</p>
    {/if}
  {/if}

  {#if $poll.open}
    <a href="#/polls/open">Go to open polls</a>
  {:else}
    <a href="#/polls/closed">Go to closed polls</a>
  {/if}

{/if}
