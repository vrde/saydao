<script>
  import DOMPurify from "dompurify";
  import marked from "marked";
  import DateTime from "src/components/DateTime.svelte";
  import Loading from "src/components/Loading.svelte";
  import CONFIG from "src/config";

  let vote = null;
  let state = {};

  // `id` the id of the poll
  export let id;
  // `title` the title of the poll
  export let title;
  // `question` the question of the poll
  export let question;
  // `choices` the choices of the poll
  export let choices;
  // `end` the date when the poll closes
  export let end;
  // `hasVotedFor` the option the member voted
  export let hasVotedFor;
  // `hasTokens` if the member has tokens to vote
  export let hasTokens;
  // `votesPerc`
  export let votesPerc;
  // `open` is the poll still open?
  export let open;
  // `totalVotesPerc` perc of the tokens that voted
  export let totalVotesPerc;
  // `finalDecision` the choice that won the poll. Null if quorum not reached.
  export let finalDecision;
  // `quorumReached` has the quorum been reached?
  export let quorumReached;
  // `toQuorum` how much is left to reach the quorum
  export let toQuorum;
  // `isMeeting` is the poll to decide for a meeting/
  export let isMeeting;
  // `meetingType` the type of the meeting, can be `online`, `physical`, or `online+physical`
  export let meetingType;
  // `meetingUrl`
  export let meetingUrl;
  // `meetingAddress`
  export let meetingAddress;
  // `meetingStart` the start date of the meeting
  export let meetingStart;
  // `meetingEnd` the end date of the meeting
  export let meetingEnd;
  // `meetingSupervisor` the supervisor of the meeting
  export let meetingSupervisor;

  export let handleSubmit;

  $: proposalState = quorumReached
    ? "approved"
    : !open && !quorumReached
    ? "rejected"
    : "";

  function handleClose() {
    state = {};
  }
</script>

<style>
  input {
    width: var(--size);
    height: var(--size);
  }

  .body {
    background-color: #fff176;
    transition: background-color 1s;
    padding: var(--size-xl) 0;
    border-width: var(--size-px);
    border-top-style: solid;
    border-bottom-style: solid;
    border-color: #daca41;
  }

  .approved .body {
    background-color: #beff72;
    border-color: #89c941;
  }

  .rejected .body {
    background-color: #ffb3b3;
    border-color: #ff8f8f;
  }

  .footer {
    margin-top: var(--size-xxl);
  }

  ol {
    list-style-type: none;
    padding: 0;
  }

  ol li {
    margin: 0 0 var(--size-s) 0;
    padding: 0;
  }

  li label,
  li p {
    display: block;
    padding: var(--size) var(--size-l);
    font-size: var(--size-m);
    border-radius: var(--size-xxs);
  }

  li p,
  li label {
    border: var(--size-px) solid #ccc;
  }

  li label {
    cursor: pointer;
  }

  li p.winner,
  li label.active {
    border: var(--size-px) solid #4caf50;
    box-shadow: inset 0 0 0px 2px #4caf50;
  }
</style>

<Loading {state} onClose={handleClose} />

{#if id}
  <div class={proposalState}>
    <div class="header">
      <section>
        {#if isMeeting}
          <h1>Event proposal</h1>
        {:else}
          <h1>Poll</h1>
        {/if}
        {#if open}
          <p>
            <strong>{totalVotesPerc}%</strong> of {CONFIG.name} voted on this poll.
            {#if quorumReached}
              <strong>Quorum has been reached</strong>.
            {:else}
              <strong>{toQuorum}%</strong> more votes are needed for a quorum.
            {/if}
          </p>
          <p>
            <em>Voting closes on <DateTime date={end} countdown={true} /></em>
          </p>
        {:else}
          <p>
            <strong>{totalVotesPerc}%</strong> of the DAO voted on this poll.
            {#if quorumReached}
              <strong>Quorum has been reached</strong>.
            {:else}
              <strong>Quorum has not been reached</strong>.
            {/if}
          </p>
          <p><em>Voting ended on <DateTime date={end} /></em></p>
        {/if}
      </section>
    </div>

    <div class="body">
      <section>
        <h3>{title}</h3>
        {#if isMeeting}
          <ul>
            <li>
              <strong>Event type</strong>:
              {#if meetingType === "online"}
                online only
              {:else if meetingType === "physical"}
                in-person only
              {:else if meetingType === "online+physical"}
                online and in-person
              {/if}
            </li>
            {#if meetingUrl}
              <li>
                <strong>Video conference link</strong>:
                <a href={meetingUrl}>{meetingUrl}</a>
              </li>
            {/if}
            {#if meetingAddress}
              <li><strong>Event address</strong>: {meetingAddress}</li>
            {/if}
            <li>
              <strong>Start date</strong>: <DateTime date={meetingStart} />
            </li>
            <li>
              <strong>End date</strong>: <DateTime date={meetingEnd} />
            </li>
            <li>
              <strong>Supervisor</strong>: member #{meetingSupervisor}
            </li>
          </ul>
        {/if}

        <div class="question">
          {@html DOMPurify.sanitize(marked(question))}
        </div>
      </section>
    </div>

    <div class="vote">
      <section>
        {#if hasVotedFor === null && open && hasTokens}
          {#if isMeeting}
            <h2>Do you want to approve this event?</h2>
          {:else}
            <h2>Make your choice</h2>
          {/if}
          <form on:submit|preventDefault={() => handleSubmit(vote)}>
            <ol>
              {#each choices as choice, i}
                <li>
                  <label class:active={vote === i}>
                    <input type="radio" bind:group={vote} value={i} />
                    {choice}
                  </label>
                </li>
              {/each}
            </ol>

            <button class="button-shadow full" disabled={vote === null}
              ><span>Vote!</span></button
            >
          </form>
        {:else}
          {#if quorumReached}
            <h2>Quorum has been reached</h2>
            {#if finalDecision !== null}
              <p>Winning choice: <strong>{choices[finalDecision]}</strong></p>
            {/if}
          {:else}
            <h2>Quorum has not been reached</h2>
          {/if}
          <ol>
            {#each choices as choice, i}
              <li>
                <p class:winner={finalDecision === i}>
                  <strong>{choice}</strong><br />
                  Votes: {votesPerc[i]}%
                  {#if hasVotedFor === i}
                    (You voted for this)
                  {/if}
                </p>
              </li>
            {/each}
          </ol>
          {#if open && hasTokens === null}
            <p>
              <strong>Note:</strong> you can't vote on this poll because you
              joined {CONFIG.name}
              after the poll was created.
            </p>
          {/if}
        {/if}
      </section>
    </div>

    <section class="footer">
      {#if open}
        <a href="#/polls/open">Go to open polls</a>
      {:else}
        <a href="#/polls/closed">Go to closed polls</a>
      {/if}
    </section>
  </div>
{/if}
