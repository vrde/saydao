<script>
  import { memberList } from "src/state/dao";
  import { wallet } from "src/state/eth";
  import Loading from "src/components/Loading.svelte";
  import baseX from "base-x";
  import { push } from 'svelte-spa-router'
  import CONFIG from "src/config";
  import { ONE_HOUR, ONE_DAY, ONE_WEEK, splitDate, fromSplitToTimestamp } from "./utils";

  const bs58 = baseX("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");

  // FIXME: should not use an object from window
  const ipfs = IpfsHttpClient(CONFIG.ipfsEndpoint);

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
    if (!confirm("Are you sure? You won't be able to edit it later")) return;
    state = "working"

    // Upload to IPFS and get the CID
    const data = { title, question, start, end, duration };
    let cid;
    try {
      const added = await ipfs.add(JSON.stringify(data))
      cid = added.cid.toString();
      await ipfs.pin.add(added.cid);
      console.log('Poll uploaded and pinned to IPFS with cid', cid);
    } catch (err) {
      console.error(err)
      return;
    }

    // Create the meeting poll in the smart contract

    try {
        // First 2 bytes/4 nibbles are the id of the hash func
      const cidHex = "0x" + (bs58.decode(cid).toString("hex")).substr(4);
      const receipt = await $wallet.contracts.SayDAO.createMeetingPoll(
        cidHex,
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
    <h1>Submitting your poll</h1>
    <p>Please wait, this is slow as hell.</p>
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
    <legend>When will the event happen?</legend>
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
    <p><strong>Note:</strong> you cannot create events that start sooner than one week.</p>
  </fieldset>

  <label>Who is the supervisor?
    <select bind:value={supervisor} required>
      {#each $memberList as member}
        <option value="{member.memberId}">Member {member.memberId}</option>
      {/each}
    </select>
  </label>

  <label>How long should be the poll stay open?
    <select bind:value={duration}>
      <!--TESTING-->
      <option value="60">1 minute</option>
      <option value="600">10 minutes</option>
      <!--END TESTING-->
      <option value="{60*60*24*7}" selected>7 days</option>
      <option value="{60*60*24*30}">30 days</option>
    </select>
  </label>

  <button type="submit">Launch poll</button>
</form>
