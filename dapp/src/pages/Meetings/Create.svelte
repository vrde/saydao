<script>
  import { pollMeetingDurations, minPollMeetingDuration } from "src/state/dao";
  import { list as members } from "src/state/dao/member";
  import { wallet } from "src/state/eth";
  import Loading from "src/components/Loading.svelte";
  import { push } from "svelte-spa-router";
  import {
    ONE_HOUR,
    ONE_DAY,
    ONE_WEEK,
    prettyDuration,
    splitDate,
    fromSplitToTimestamp,
  } from "./utils";

  import * as ipfs from "src/ipfs";

  let title = "";
  let question = "";
  let duration = 60 * 60 * 24 * 7;
  let supervisor;
  let address;
  let url;
  let type;
  let state = {};

  let [nowDate, nowTime] = splitDate(new Date());
  let minStartDate, minStartTime;
  let startDate, startTime;
  let endDate, endTime;

  $: {
    if ($minPollMeetingDuration !== undefined) {
      const min = new Date(
        Date.now() + $minPollMeetingDuration * 1000 + ONE_HOUR
      );
      if (minStartDate === undefined) {
        [minStartDate, minStartTime] = splitDate(min);
        [startDate, startTime] = [minStartDate, minStartTime];
        [endDate, endTime] = [startDate, startTime];
      }
    }
  }

  function handleClose() {
    state = {};
  }

  async function handleSubmit(e) {
    const start = fromSplitToTimestamp(startDate, startTime);
    const end = fromSplitToTimestamp(endDate, endTime);
    // Event must start after the poll ends, and if those two dates are too close
    // (like in the same minute) the transaction is likely to fail.
    const durationDate =
      new Date(Date.now() + duration * 1000).getTime() / 1000;
    if (start - durationDate < 60) {
      alert(
        "The end of the poll and the beginning of the event are too close, change one of the two."
      );
      return;
    }
    if (!confirm("Are you sure? You won't be able to edit this later.")) return;
    state.action = "submit";

    // Upload to IPFS and get the CID
    const data = {
      title,
      question,
      start,
      end,
      type,
      url,
      address,
      duration,
    };
    const cid = await ipfs.add(data);

    // Create the meeting poll in the smart contract
    try {
      const receipt = await $wallet.contracts.SayDAO.createMeetingPoll(
        ipfs.cidToUint(cid),
        parseInt(duration, 10),
        start,
        end,
        supervisor
      );
      console.log("createMeetingPoll receipt", receipt);
      state = {};
    } catch (err) {
      console.error(err);
      state.error = err.toString();
      return;
    }

    push("/polls/open");
  }
</script>

<style>
  li,
  li div {
    margin: var(--size) 0 0 var(--size-l);
  }
  li div label {
    display: block;
    margin-bottom: var(--size-s);
  }
  li div input {
    margin-bottom: var(--size);
  }
</style>

<Loading {state} onClose={handleClose} />

<section>
  <h1>Propose a new event</h1>

  <p>
    Events keep the DAO active. Members participating to an event are rewarded
    with <strong>Say tokens</strong>. This form allows you to propose a new
    event. If the DAO approves your proposal, then the event will become reality
    and members will be able to attend it.
  </p>

  <form on:submit|preventDefault={handleSubmit}>
    <div>
      <h2>What is the title of the event?</h2>
      <input
        aria-label="Title"
        type="text"
        bind:value={title}
        required
        autocomplete="off"
      />
    </div>

    <div>
      <h2>What is the topic of the event?</h2>
      <p class="note">
        You can use
        <a
          href="https://guides.github.com/features/mastering-markdown/#syntax"
          target="_blank">markdown</a
        > to format the text.
      </p>
      <textarea aria-label="Topic" bind:value={question} required />
    </div>

    <div>
      <h2>When does the event start?</h2>
      <p class="note">
        Events must begin at least {prettyDuration(
          $minPollMeetingDuration * 1000
        )} from now so members have time to vote.
      </p>
      <input
        aria-label="Start date"
        bind:value={startDate}
        type="date"
        min={minStartDate}
        required
      />
      <input
        aria-label="Start time"
        bind:value={startTime}
        on:change={() => (endTime = startTime)}
        type="time"
        min={startDate === nowDate ? minStartTime : ""}
        required
      />
    </div>
    <div>
      <h2>When does the event end?</h2>
      <input
        aria-label="End date"
        bind:value={endDate}
        type="date"
        min={startDate}
        required
      />
      <input
        aria-label="End time"
        bind:value={endTime}
        type="time"
        min={startDate === endDate ? startTime : ""}
        required
      />
    </div>

    <div>
      <h2>Where does the event take place?</h2>
      <ul>
        <li>
          <label>
            <input type="radio" bind:group={type} value="online" /> Online only
          </label>
          {#if type === "online"}
            <div>
              <label for="meeting-url">Video conference link (optional)</label>
              <input id="meeting-url" type="text" bind:value={url} />
            </div>
          {/if}
        </li>
        <li>
          <label>
            <input type="radio" bind:group={type} value="physical" />
            In-person only
          </label>
          {#if type === "physical"}
            <div>
              <label for="meeting-address">Event address (optional)</label>
              <input id="meeting-address" type="text" bind:value={address} />
            </div>
          {/if}
        </li>
        <li>
          <label>
            <input type="radio" bind:group={type} value="online+physical" />
            Both online and in-person
            {#if type === "online+physical"}
              <div>
                <label for="meeting-url">Video conference link (optional)</label
                >
                <input id="meeting-url" type="text" bind:value={url} />
                <label for="meeting-address">Event address (optional)</label>
                <input id="meeting-address" type="text" bind:value={address} />
              </div>
            {/if}
          </label>
        </li>
      </ul>
    </div>

    <div>
      <h2>Who is the supervisor?</h2>
      <p class="note">
        The supervisor is a member responsible to make the event happen.
      </p>
      <select aria-label="Supervisor" bind:value={supervisor} required>
        {#if $members}
          <option value="">Select a Member</option>
          {#each $members as member, i}
            <option value={member.id}>Member {member.id}</option>
          {/each}
        {:else}
          <option value="">Wait, loading members...</option>
        {/if}
      </select>
    </div>

    <div>
      <h2>How long should the poll stay open?</h2>
      <select aria-label="Duration" bind:value={duration}>
        {#each $pollMeetingDurations as [value, label]}
          <option {value}>{label}</option>
        {/each}
      </select>
    </div>

    <div>
      <h2>Ready to submit your event?</h2>
      <button class="button-shadow" type="submit">
        <span>Yep, create event</span>
      </button>
    </div>
  </form>
</section>
