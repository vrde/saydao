<script>
  import { slide } from "svelte/transition";
</script>

<style type="text/scss">
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
    /*backdrop-filter: blur(10px);*/
  }

  div {
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

<section transition:slide>
  <div>
    <slot>
      Please wait
    </slot>
  </div>
</section>
