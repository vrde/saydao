<script>
  import { wallet } from "src/state/eth";
  import Loading from "src/components/Loading.svelte";
  import baseX from "base-x";
  import { push } from 'svelte-spa-router'
  import CONFIG from "src/config";

  const bs58 = baseX("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");

  // FIXME: should not use an object from window
  const ipfs = IpfsHttpClient(CONFIG.ipfsEndpoint);

  let title = "";
  let question = "";
  let choices = ["", ""];
  let duration = 60*60*24*7;
  let state = "idle";

  async function handleSubmit(e) {
    if (!confirm("Are you sure? You won't be able to edit it later")) return;
    state = "working"

    // Upload to IPFS and get the CID
    const data = { title, question, choices, duration };
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

    // Create the poll in the smart contract

    try {
        // First 2 bytes/4 nibbles are the id of the hash func
      const cidHex = "0x" + (bs58.decode(cid).toString("hex")).substr(4);
      const receipt = await $wallet.contracts.SayDAO.createPoll(cidHex, parseInt(duration, 10), choices.length);
      console.log("createPoll receipt", receipt);
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

<h1>Create a Poll</h1>

<form on:submit|preventDefault={handleSubmit}>
  <label>What is the title of the poll?
    <input type="text" bind:value={title} required />
  </label>

  <label>What is the poll question?
    <textarea bind:value={question} required></textarea>
  </label>

  <fieldset>
    <legend>What are the choices in the poll? Enter at least two.</legend>
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

  <label>How long should be the poll stay open?
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

  <button type="submit">Launch poll</button>
</form>
