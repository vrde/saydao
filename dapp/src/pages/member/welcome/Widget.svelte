<script>
  import confetti from "./confetti";
  import { onMount } from "svelte";

  export let wallet;
  export let name;
  export let memberId;
  export let txHash;
  export let networkName;

  onMount(() => {
    confetti.start(3000, 100, 150);
  });

  function handleMoarConfetti() {
    confetti.start(3000, 100, 150);
  }
</script>

<style>
  .fullpage {
    background-color: var(--join--color-success);
  }
  details {
    margin-top: var(--size-xxl);
  }

  .confetti {
    cursor: pointer;
    display: inline-block;
    animation-name: pulse;
    animation-duration: 3s;
    animation-iteration-count: infinite;
  }

  @keyframes pulse {
    from {
      transform: scale(0.9);
    }
    50% {
      transform: scale(1.1);
    }
    to {
      transform: scale(0.9);
    }
  }
</style>

<div class="fullpage">
  <section>
    {#if wallet && memberId}
      <h1>
        Welcome to {name}
        <span class="confetti" on:click={handleMoarConfetti}>🎉</span>
      </h1>
      <p>You are registered as <strong>member {memberId}</strong>.</p>
      <a class="button-shadow" href="#/"
        ><span>Go back to the home page to participate</span></a
      >
      <details>
        <summary>What just happened?</summary>
        <p>
          Your membership was recorded on the {networkName} Ethereum blockchain.
          You can peek behind the curtain here:
          <a
            href="https://{networkName}.etherscan.io/tx/{txHash}"
            target="_blank">{txHash}</a
          >.
        </p>
      </details>
    {/if}
  </section>
</div>
