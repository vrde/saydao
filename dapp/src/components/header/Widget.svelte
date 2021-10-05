<script>
  export let memberId;
  export let role;
  export let balance;
  export let shares;
  export let name;
  export let location;
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

  h1 a span {
    font-size: var(--size-m);
  }

  p a {
    font-size: var(--size-m);
  }

  a:visited {
    color: inherit;
  }
</style>

<section>
  <header role="banner">
    <h1>
      {name}
      {#if location !== "/"}
        <a href="#/">
          <span>
            <br /> ← Go back to homepage
          </span>
        </a>
      {/if}
    </h1>

    {#if memberId}
      <p>
        You are <strong>{role} {memberId}</strong><br />
        You have <strong>{balance} Say ({shares})</strong><br />
        <a href="#/settings">Your settings</a>
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
