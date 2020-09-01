<script>
  import DOMPurify from "dompurify";
  import marked from "marked";
  import DateTime from 'src/components/DateTime.svelte';
  import Participants from './components/Participants.svelte';
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

  function handleParticipantListDone() {
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

  {#if $poll.open && $poll.meetingValid}
    <div class="details">
      <p>
        <strong>Poll is still open</strong>, no decision has been made yet.
        <a href="#/polls/details/{$poll.id}">Go to Poll #{$poll.id}</a>.
      </p>
    </div>
  {/if}
  {#if !$poll.open && !$poll.meetingValid}
    <div class="details">
      <p>
        This event won't take place.
        <a href="#/polls/details/{$poll.id}">Go to Poll #{$poll.id}</a>.
      </p>
    </div>
  {/if}
  {#if $poll.meetingValid}
    <div class="details">
      <p>
        This event has been decided in <a href="#/polls/details/{$poll.id}">Poll #{$poll.id}</a>.
      </p>
    </div>
  {/if}
  <hr/>

  <h1>{$poll.title}</h1>

  {#if $poll.meetingValid}
    <p>
      The event happens between
      <strong><DateTime date={$poll.meetingStart} /></strong>
      and
      <strong><DateTime date={$poll.meetingEnd} /></strong>
    </p>
  {/if}

  <div class="question">
    {@html DOMPurify.sanitize(marked($poll.question))}
  </div>

  {#if $poll.meetingValid && $poll.actionRequired}
    <Participants poll={$poll} onDone={handleParticipantListDone}/>
  {/if}

{/if}
