<script>
  import { wallet } from 'src/state/eth';
  import { currentPollId, currentPoll as poll } from 'src/state/dao/poll';
  import { location } from 'svelte-spa-router';
  import Loading from "src/components/Loading.svelte";

  $: {
    $currentPollId = $location.split("/").pop();
    console.log($currentPollId);
  }

  let vote;
  let state = "idle";

  async function handleSubmit() {
    state = "submit";
    try {
      await $wallet.contracts.SayDAO.vote($currentPollId, vote);
    } catch(e) {
      console.error(e);
    }
    let state = "idle";
  }

</script>

{#if state !== "idle"}
  <Loading>
    <h1>Submitting your vote</h1>
    <p>Please wait, this is slow as hell.</p>
  </Loading>
{/if}

{#if $poll}

  <h1>{$poll.title}</h1>
  <p><em>Voting closes on {$poll.end}</em></p>
  <p>{$poll.question}</p>
  <form on:submit|preventDefault={handleSubmit}>
    <fieldset>
      <legend>Make your choice</legend>
      {#each $poll.choices as choice, i}
        <label><input type="radio" bind:group={vote} value={i} />{choice}</label>
      {/each}
    </fieldset>
    <button>Vote!</button>
  </form>

{:else}
  loading...
{/if}
