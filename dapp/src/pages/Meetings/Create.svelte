<script>
  import { memberList } from "src/state/dao";
  import { wallet } from "src/state/eth";
  import Loading from "src/components/Loading.svelte";
  import { push } from 'svelte-spa-router'
  import { ONE_HOUR, ONE_DAY, ONE_WEEK, splitDate, fromSplitToTimestamp } from "./utils";

  import * as ipfs from "src/ipfs";

  let title = "";
  let question = "";
  let duration = 60*60*24*7;
  let supervisor;
  let activity = {
    state: "idle",
    error: null
  }

  let [minStartDate, minStartTime] = splitDate(new Date());
  let [startDate, startTime] = [minStartDate, minStartTime];
  let [endDate, endTime] = [startDate, startTime];

  $: {
  //  const max = Math.max(duration * 1000, ONE_WEEK + ONE_HOUR);
    //TESTING
    const max = Math.max(duration * 1000);
    //END TESTING
    [minStartDate, minStartTime] = splitDate(new Date(Date.now() + max));
  }

  async function handleSubmit(e) {
    const start = fromSplitToTimestamp(startDate, startTime);
    const end = fromSplitToTimestamp(endDate, endTime);
    // Event must start after the poll ends, and if those two dates are too close
    // (like in the same minute) the transaction is likely to fail.
    const durationDate = new Date(Date.now() + duration * 1000).getTime() / 1000;
    if (start - durationDate < 60) {
      alert('The end of the poll and the beginning of the event are too close, change one of the two.');
      return;
    }
    if (!confirm("Are you sure? You won't be able to edit this later.")) return;
    activity.state = "working"

    // Upload to IPFS and get the CID
    const data = { title, question, start, end, duration };
    const cid = await ipfs.add(data);

    // Create the meeting poll in the smart contract
    try {
      const receipt = await $wallet.contracts.SayDAO.createMeetingPoll(
        ipfs.cidToUint(cid),
        parseInt(duration, 10),
        start,
        end,
        supervisor);
      console.log("createMeetingPoll receipt", receipt);
    } catch (err) {
      console.error(err)
      activity.state = "error";
      activity.error = err;
      return;
    }

    push("/polls/open");

    activity.state = "idle";
  }
</script>

<style>
textarea {
  height: var(--size-l);
}
</style>

{#if activity.state === "working"}
  <Loading>
    <h1>Creating your poll</h1>
    <p>Please be patient. This will be a slow process!</p>
  </Loading>
{:else if activity.state === "error"}
  <Loading>
    <h1>Oops, someting went wrong</h1>
    <p>{activity.error}</p>
  </Loading>
{/if}

<h1>Propose a new Event</h1>

<form on:submit|preventDefault={handleSubmit}>
  <label>What is the title of the event?
    <input type="text" bind:value={title} required />
  </label>

  <label>What is the topic of the event?
    <textarea bind:value={question} required></textarea>
  </label>

  <fieldset>
    <legend>When is the event?</legend>
    <p>
      <label>Start<br/>
        <input bind:value={startDate} on:change={()=>(endDate=startDate)} type="date" min={minStartDate} required />
        <input bind:value={startTime} on:change={()=>(endTime=startTime)} type="time" min={minStartTime} required />
      </label>
    </p>
    <p>
      <label>End<br/>
        <input bind:value={endDate} type="date" min={startDate} required />
        <input bind:value={endTime} type="time" min={startDate === endDate ? startTime : ""} required />
      </label>
    </p>
    <p><strong>Note:</strong> Events must begin at least one week from now.</p>
  </fieldset>

  <label>Who is the supervisor?
    <select bind:value={supervisor} required>
      {#if $memberList}
        <option value="">Select a Member</option>
        {#each $memberList as member, i}
          <option value="{member.memberId}">Member {member.memberId}</option>
        {/each}
      {:else}
        <option value="">Wait, loading members...</option>
      {/if}
    </select>
  </label>

  <label>How long should the poll stay open?
    <select bind:value={duration}>
      <!--TESTING-->
      <option value="60">1 minute</option>
      <option value="600">10 minutes</option>
      <!--END TESTING-->
      <option value="{60*60*24*7}" selected>7 days</option>
      <option value="{60*60*24*30}">30 days</option>
    </select>
  </label>

  <button type="submit">Create poll</button>
</form>
