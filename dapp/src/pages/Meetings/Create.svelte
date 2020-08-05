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
  let state = "idle";
  let supervisor;

  //let [minStartDate, minStartTime] = splitDate(new Date(Date.now() + ONE_WEEK + ONE_HOUR));
  //TESTING
  let [minStartDate, minStartTime] = splitDate(new Date());
  //END TESTING
  let [startDate, startTime] = [minStartDate, minStartTime];
  let [endDate, endTime] = splitDate(new Date(Date.now() + ONE_WEEK + ONE_HOUR * 2));
  console.log(startDate, startTime);
  console.log(fromSplitToTimestamp(startDate, startTime));

  async function handleSubmit(e) {
    const start = fromSplitToTimestamp(startDate, startTime);
    const end = fromSplitToTimestamp(endDate, endTime);
    if (!confirm("Are you sure? You won't be able to edit this later.")) return;
    state = "working"

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
      return;
    }

    push("/polls/open");

    state = "idle";
  }
</script>

<style>
textarea {
  height: var(--size-l);
}
</style>

{#if state !== "idle"}
  <Loading>
    <h1>Creating your poll</h1>
    <p>Please be patient. This will be a slow process!</p>
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
      <option value="">Select a Member</option>
      {#each $memberList as member, i}
        <option value="{member.memberId}">Member {member.memberId}</option>
      {/each}
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
