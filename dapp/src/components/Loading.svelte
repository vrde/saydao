<script>
  import { slide } from "svelte/transition";
  export let state;
  export let onClose;
</script>

<style>
  section {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background-color: rgba(255, 255, 255, 0.9);
    z-index: 99999;
    font-size: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    /*backdrop-filter: blur(10px);*/
  }

  div.working {
    animation: blink 2s infinite;
  }

  @keyframes blink {
    0% {
      opacity: 1;
    }

    50% {
      opacity: 0.5;
    }
  }
</style>

{#if state.action || state.error}
  <section transition:slide>
    <div class:working={!state.error}>
      {#if state.error}
        <h2>Oops, something went wrong :(</h2>
        <p>Please give it another try.</p>
        <button on:click={onClose}>Close</button>
        <details>
          {state.error}
        </details>
      {:else}
        <p>Please wait. This will take a while.</p>
      {/if}
    </div>
  </section>
{/if}
