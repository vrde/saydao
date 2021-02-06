<script>
  export let name;
</script>

<div role="banner">
  <section>
    <h2>
      Welcome to {name}
    </h2>
    <p>To participate in {name}, you need to log in.</p>
    <ul>
      <li>
        <a href="#/login">Log in now</a> if you've already joined.
      </li>
      <li>
        <a href="mailto:agranzot@mailbox.org?subject=Invite me to {name}"
          >Request an invite</a
        >
        if you are a {name} member and want to join.
      </li>
    </ul>
    <p>If you're just looking around, you don't need to log in.</p>
  </section>
</div>

<style>
  div {
    background-color: #222;
    color: white;
  }

  section {
    padding-top: var(--size-l);
    padding-bottom: var(--size-l);
  }

  h2 {
    font-size: calc(var(--f) * var(--size-xl));
  }

  p,
  li {
    font-size: calc(var(--f) * var(--size-l));
  }
</style>
