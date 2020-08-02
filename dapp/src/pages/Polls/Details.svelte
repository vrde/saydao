<script>
  import DateTime from 'src/components/DateTime.svelte';
  import { wallet } from 'src/state/eth';
  import { currentPollId, refresh, currentPoll as poll } from 'src/state/dao/poll';
  import { location } from 'svelte-spa-router';
  import Loading from "src/components/Loading.svelte";
  export let params = null;

  let vote = null;
  let state = "idle";

  $currentPollId = params.id;

  $: {
    if ($poll && $poll.hasVotedFor) {
      vote = $poll.hasVotedFor;
    }
  }

  async function handleSubmit() {
    state = "submit";
    try {
      await $wallet.contracts.SayDAO.vote($currentPollId, vote);
    } catch(e) {
      console.error(e);
    }
    state = "idle";
    $refresh = Date.now();
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

{#if state !== "idle"}
  <Loading>
    <h1>Submitting your vote</h1>
    <p>Please wait, this is slow as hell.</p>
  </Loading>
{/if}

{#if $poll}
  {#if $poll.open}
    <a href="#/polls/open">Go to open polls</a>
  {:else}
    <a href="#/polls/closed">Go to closed polls</a>
  {/if}

  <h1>{$poll.title}</h1>
  {#if $poll.open}
    <div class="details">
      <p>
        <strong>{$poll.totalVotesPerc}%</strong> of the DAO voted on this poll.
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

  <p class="question">{$poll.question}</p>

  <p>
    The event will happen between
    <DateTime date={$poll.meetingStart} />
    and
    <DateTime date={$poll.meetingEnd} />.
  </p>
  {#if $poll.hasVotedFor === null && $poll.open && $poll.hasTokens}
    <form on:submit|preventDefault={handleSubmit}>
      <fieldset disabled={$poll.hasVotedFor}>
        <legend>Make your choice</legend>
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
    <p><strong>Note:</strong> you cannot vote on this poll because you joined the DAO after the poll was created.</p>
    {/if}
  {/if}

{/if}
