<script>
  import { list as members } from "src/state/dao/member";
  import { wallet } from "src/state/eth";
  import Loading from "src/components/Loading.svelte";
  import { push } from 'svelte-spa-router'
  import { ONE_HOUR, ONE_DAY, ONE_WEEK, splitDate, fromSplitToTimestamp } from "./utils";

  import * as ipfs from "src/ipfs";

  let title = "";
  let question = "";
  let duration = 60*60*24*7;
  let supervisor;
  let state = {};

  let [nowDate, nowTime] = splitDate(new Date());
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

  function handleClose() {
    state = {};
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
    state.action = "submit";

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
      state = {};
    } catch (err) {
      console.error(err)
      state.error = err.toString();
      return;
    }

    push("/polls/open");
  }
</script>

<style>
textarea {
  height: var(--size-l);
}
</style>

<Loading {state} onClose={handleClose}/>

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
        <input bind:value={startTime} on:change={()=>(endTime=startTime)} type="time" min={startDate === nowDate ? minStartTime : ""} required />
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
      {#if $members}
        <option value="">Select a Member</option>
        {#each $members as member, i}
          <option value="{member.id}">Member {member.id}</option>
        {/each}
      {:else}
        <option value="">Wait, loading members...</option>
      {/if}
    </select>
  </label>

  <label>How long should the poll stay open?
    <select bind:value={duration}>
      <!--TESTING
      <option value="60">1 minute</option>
      <option value="600">10 minutes</option>
      END TESTING-->
      <option value="{60*60*24*7}" selected>7 days</option>
      <option value="{60*60*24*30}">30 days</option>
    </select>
  </label>

  <button type="submit">Create poll</button>
</form>
