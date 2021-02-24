<script>
  export let level = "info";
</script>

<p role="alert" class="level-{level}">
  <slot />
</p>

<style>
  p {
    text-align: center;
    margin: 0;
    padding: 10px;
    font-size: 1.2rem;
  }

  .level-error {
    color: white;
    background-color: tomato;
  }

  .level-warning {
    color: black;
    background-color: yellow;
  }

  .level-info {
    color: white;
    background-color: blue;
  }
</style>
