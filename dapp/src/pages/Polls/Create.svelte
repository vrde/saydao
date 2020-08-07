<script>
  import { wallet } from "src/state/eth";
  import Loading from "src/components/Loading.svelte";
  import baseX from "base-x";
  import { push } from 'svelte-spa-router'
  import * as ipfs from "src/ipfs";

  let title = "";
  let question = "";
  let choices = ["", ""];
  let duration = 60*60*24*7;
  let state = {};

  function handleClose() {
    state = {};
  }

  async function handleSubmit(e) {
    if (!confirm("Are you sure? You won't be able to edit it later")) return;
    state.action = "working"

    try {
      // Upload to IPFS and get the CID
      const data = { title, question, choices, duration };
      const cid = await ipfs.add(data);

      // Create the poll in the smart contract

      const receipt = await $wallet.contracts.SayDAO.createPoll(
        ipfs.cidToUint(cid), parseInt(duration, 10), choices.length);
      console.log("createPoll receipt", receipt);
      state = {}
    } catch (err) {
      console.error(err)
      state.error = err.toString()
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

<Loading {state} onClose={handleClose}/>

<h1>Create a poll</h1>

<form on:submit|preventDefault={handleSubmit}>
  <label>What is the title of the poll?
    <input type="text" bind:value={title} required />
  </label>

  <label>What is the poll question?
    <textarea bind:value={question} required></textarea>
  </label>

  <fieldset>
    <legend>What are the options to choose between? Enter at least two.</legend>
    <ol>
      {#each choices as choice, i}
      <li>
        <input type="text" bind:value={choices[i]} required/>
      </li>
      {/each}
    </ol>
    <button type="button" on:click={()=>(choices.length < 8) && (choices = [...choices, ""])}>Add more poll options</button>
    {#if choices.length > 2}
    <button type="button" on:click={()=>{choices.pop(); choices = choices}}>Remove last poll option</button>
    {/if}
  </fieldset>

  <label>How long should the poll stay open?
    <select bind:value={duration}>
      <!--TESTING-->
      <option value="60">1 minute</option>
      <option value="600">10 minutes</option>
      <!--END TESTING-->
      <option value="{60*60}">1 hour</option>
      <option value="{60*60*24}">1 day</option>
      <option value="{60*60*24*7}" selected>7 days</option>
      <option value="{60*60*24*30}">30 days</option>
    </select>
  </label>

  <button type="submit">Open the poll</button>
</form>
