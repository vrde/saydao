<script>
  import { wallet } from "src/state/eth";
  import { list as members } from "src/state/dao/member";
  import Loading from "src/components/Loading.svelte";
  import { createBitmaps, toBinary } from "../utils";

  export let poll;
  export let onDone;

  let memberIds = [];
  let state = {};

  function handleClose() {
    state = {};
  }

  async function handleSubmit() {
    state.action = "submit";
    console.log("Submit presence for members", memberIds);
    const bitmaps = createBitmaps(memberIds);
    try {
      for (let cluster in bitmaps) {
        console.log("Cluster", cluster);
        console.log("Bitmap", toBinary(bitmaps[cluster]));
        await $wallet.contracts.SayDAO.updateMeetingParticipants(
          poll.meetingId,
          cluster,
          bitmaps[cluster]
        );
      }
      console.log("Seal participant list");
      await $wallet.contracts.SayDAO.sealMeetingParticipants(poll.meetingId);
      await handleTokenDistribution();
      state = {};
    } catch (e) {
      console.error(e);
      state.error = e.toString();
    }
  }

  async function handleTokenDistribution() {
    console.log("Start token distribution");

    while (true) {
      const toProcess = await $wallet.contracts.SayDAO.getRemainingDistributionClusters(
        poll.meetingId
      );

      if (toProcess.isZero()) break;

      console.log("Clusters left to process", toProcess.toNumber());

      await $wallet.contracts.SayDAO.distributeMeetingTokens(poll.meetingId, 8);
    }

    try {
      //await $wallet.contracts.SayDAO.vote($currentPollId, vote);
    } catch (e) {
      console.error(e);
    }
    state = "idle";
    onDone();
  }
</script>

<Loading {state} onClose={handleClose} />

{#if poll.meetingState === "initial"}
  <h2>Select the participants</h2>

  <p>
    You are the supervisor of this event. Select the members who participated in
    the event to award Say tokens.
  </p>

  <form on:submit|preventDefault={handleSubmit}>
    <formset>
      <legend>Select the participants</legend>
      {#if $members}
        {#each $members as member}
          <label>
            <input type="checkbox" bind:group={memberIds} value={member.id} />
            Member #{member.id}
          </label>
        {/each}
      {:else}
        Wait, loading members...
      {/if}
    </formset>

    <button type="submit">Submit</button>
  </form>
{/if}

{#if poll.meetingState === "sealed"}
  <h2>Distribute tokens to participants</h2>

  <p>
    You are the supervisor of this event. Please distribute Say tokens to
    participants. Be patient! This might take a while if there were a lot of
    participants.
  </p>
  <form on:submit|preventDefault={handleTokenDistribution}>
    <button type="submit">Start distributing Say tokens</button>
  </form>
{/if}
