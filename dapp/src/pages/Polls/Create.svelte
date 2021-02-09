<script>
  import { pollDurations } from "src/state/dao";
  import { wallet } from "src/state/eth";
  import Loading from "src/components/Loading.svelte";
  import { push } from "svelte-spa-router";
  import * as ipfs from "src/ipfs";

  let title = "";
  let question = "";
  let choices = ["", ""];
  let duration = 60 * 60 * 24 * 7;
  let state = {};

  function handleClose() {
    state = {};
  }

  async function handleSubmit(e) {
    if (!confirm("Are you sure? You won't be able to edit it later")) return;
    state.action = "working";

    try {
      // Upload to IPFS and get the CID
      const data = { title, question, choices, duration };
      const cid = await ipfs.add(data);

      // Create the poll in the smart contract

      const receipt = await $wallet.contracts.SayDAO.createPoll(
        ipfs.cidToUint(cid),
        parseInt(duration, 10),
        choices.length
      );
      console.log("createPoll receipt", receipt);
      state = {};
    } catch (err) {
      console.error(err);
      state.error = err.toString();
      return;
    }

    push("/polls/open");

    state = "idle";
  }
</script>

<style>
  button {
    margin-right: var(--size-m);
  }
  li {
    margin-bottom: var(--size-m);
  }
</style>

<Loading {state} onClose={handleClose} />

<section>
  <h1>Create a poll</h1>
  <p>Polls allow the DAO to express its preference on a specific topic.</p>
  <form on:submit|preventDefault={handleSubmit}>
    <div>
      <label for="poll-title">What is the title of the poll?</label>
      <input
        id="poll-title"
        type="text"
        bind:value={title}
        required
        autocomplete="off"
      />
    </div>

    <div>
      <label for="poll-question">What is the poll question?</label>
      <p class="note">
        You can use
        <a
          href="https://guides.github.com/features/mastering-markdown/#syntax"
          target="_blank">markdown</a
        > to format the text.
      </p>
      <textarea id="poll-question" bind:value={question} required />
    </div>

    <div>
      <p class="label">
        What are the options to choose between? Enter at least two.
      </p>
      <ol>
        {#each choices as choice, i}
          <li>
            <input type="text" bind:value={choices[i]} required />
          </li>
        {/each}
      </ol>
      <button
        class="button-shadow"
        type="button"
        on:click={() => choices.length < 8 && (choices = [...choices, ""])}
        ><span>Add more poll options</span></button
      >
      {#if choices.length > 2}
        <button
          class="button-shadow"
          type="button"
          on:click={() => {
            choices.pop();
            choices = choices;
          }}
        >
          <span>Remove last poll option</span>
        </button>
      {/if}
    </div>

    <div>
      <label for="poll-duration">How long should the poll stay open?</label>
      <select id="poll-duration" bind:value={duration}>
        {#each $pollDurations as [value, label]}
          <option {value}>{label}</option>
        {/each}
      </select>
    </div>

    <div>
      <p class="label">Ready to submit your poll?</p>
      <button class="button-shadow" type="submit"
        ><span>Yep, open the poll</span></button
      >
    </div>
  </form>
</section>
