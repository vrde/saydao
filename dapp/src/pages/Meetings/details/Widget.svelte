<script>
  import DOMPurify from "dompurify";
  import marked from "marked";
  import DateInterval from "src/components/DateInterval.svelte";
  import Participants from "./Participants.svelte";
  import Loading from "src/components/Loading.svelte";

  // `id` is the id of the poll
  export let id;
  // `title` is the title of the poll
  export let title;
  // `question` is the question of the poll
  export let question;
  // `open` indicates if the poll is still open to voting or not
  export let open;
  // `meetingId` is the id of the meeting
  export let meetingId;
  // `meetingType` can be `online`, `physical`, `online+physical`
  export let meetingType;
  // `meetingUrl` links to the online meeting if any
  export let meetingUrl;
  // `meetingAddress` contains the actual address of the event
  export let meetingAddress;
  // `meetingStart` is the proposed start of the event/meeting
  export let meetingStart;
  // `meetingEnd` is the proposed end of the event/meeting
  export let meetingEnd;
  // `meetingState` is the state of the meeting
  export let meetingState;
  // `meetingValid`
  export let meetingValid;
  // `actionRequired` is set when a token distribution is required
  export let actionRequired;

  let state = {};

  function handleClose() {
    state = {};
  }

  function handleParticipantListDone() {}
</script>

<style>
  .body {
    background-color: #eee;
    padding: var(--size-xl) 0;
    border-top: var(--size-px) solid #ccc;
    border-bottom: var(--size-px) solid #ccc;
  }
  .details p {
    margin: 0;
  }
</style>

<Loading {state} onClose={handleClose} />

{#if id}
  <div class="header">
    <section>
      {#if open && meetingValid}
        <div class="details">
          <p>
            <strong>Poll is still open</strong>, no decision has been made yet.
            <a href="#/polls/details/{id}">Go to Poll #{id}</a>.
          </p>
        </div>
      {/if}
      {#if !open && !meetingValid}
        <div class="details">
          <p>
            This event won't take place.
            <a href="#/polls/details/{id}">Go to Poll #{id}</a>.
          </p>
        </div>
      {/if}

      <h1>{title}</h1>

      {#if meetingValid}
        <p>
          {#if meetingType === "online"}
            The event is online only.
          {:else if meetingType === "physical"}
            The event is in-person only.
          {:else if meetingType === "online+physical"}
            The event is both online and in-person.
          {/if}
          <br />
          <strong>When:</strong>
          <DateInterval start={meetingStart} end={meetingEnd} />
          <br />
          {#if meetingUrl}
            <strong>Join online:</strong>
            <a href={meetingUrl}>{meetingUrl}</a><br />
          {/if}
          {#if meetingAddress}
            <strong>Join in-person:</strong>{meetingAddress}
          {/if}
        </p>
      {/if}
    </section>
  </div>
  <div class="body">
    <section>
      <div class="question">
        {@html DOMPurify.sanitize(marked(question))}
      </div>
    </section>
  </div>
  <div class="action">
    <section>
      {#if meetingValid && actionRequired}
        <Participants
          {meetingId}
          {meetingState}
          onDone={handleParticipantListDone}
        />
      {/if}
    </section>
  </div>
  <div class="footer">
    <section>
      <p>
        This event has been decided in <a href="#/polls/details/{id}"
          >Poll #{id}</a
        >.
      </p>
    </section>
  </div>
{/if}
