<script>
  export let memberId;
  export let role;
  export let balance;
  export let shares;
  export let name;
</script>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  ul {
    list-style-type: none;
  }

  h1,
  a {
    font-size: var(--size-l);
  }

  a:visited {
    color: inherit;
  }
</style>

<section>
  <header role="banner">
    <h1>
      <a href="#/">{name}</a>
    </h1>

    {#if memberId}
      <p>
        You are <strong>{role} {memberId}</strong><br />
        You have <strong>{balance} Say ({shares})</strong>
      </p>
    {:else}
      <ul>
        <li>
          <a class="button-shadow" href="#/login">
            <span>Log in</span>
          </a>
        </li>
      </ul>
    {/if}
  </header>
</section>
