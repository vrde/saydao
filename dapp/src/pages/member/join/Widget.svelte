<script>
  // `handleLogin` function to handle the access to the native wallet.
  export let handleLogin;
  // `handleSubmit` function to handle the user joining the dao.
  export let handleSubmit;
  // `wallet` points to the user's wallet, can be undefined.
  export let wallet;
  // `memberId` is the current member id, can be 0.
  export let memberId;
  // `name` is the name of this dao.
  export let name;
  // `hasNativeWallet` is true if the user is on a wallet-enabled agent, false otherwise.
  export let hasNativeWallet;
  // `loggedIn`
  export let loggedIn;
  // `loginError` is a string containing an error.
  export let loginError;
  // `inviteError` is a string containing an error.
  export let inviteError;
  // `inviteMemberId` the member id contained in the invite.
  export let inviteMemberId;
  // State can be `idle`, `working`, or `error`.
  export let state;
</script>

<style>
  .fullpage {
    transition: background-color 1s;
  }

  .fullpage.idle {
    background-color: var(--join--color-idle);
  }

  .fullpage.working {
    background-color: var(--join--color-working);
  }

  .fullpage.error {
    background-color: var(--join--color-error);
  }
</style>

<div class="fullpage {state}">
  <section>
    {#if wallet && memberId}
      <h1>You are already a member of {name}</h1>
      <p>You cannot join twice.</p>
      <a class="button-shadow" href="#/"><span>Go to the homepage</span></a>
    {:else if hasNativeWallet && !loggedIn}
      <h1>You've been invited to join {name}</h1>
      <p>
        Your browser supports Ethereum. Please connect your Ethereum account.
      </p>

      {#if loginError}
        <p class="error">That didn't work. Please try again.</p>
      {/if}

      <button class="button-shadow" on:click={handleLogin} href="#"
        ><span>Connect your Ethereum account</span></button
      >
    {:else if state === "idle"}
      <h1>You've been invited to join {name}</h1>
      <form on:submit|preventDefault={handleSubmit}>
        <p>
          I want to join {name} with
          <strong>member id {inviteMemberId}</strong>.
        </p>
        <button class="button-shadow" type="submit"><span>Confirm</span></button
        >
      </form>
    {:else if state === "working"}
      <h1>Working on it</h1>
      <p>
        Please wait while your account is created. This may take up to 30
        seconds. Be patient!
      </p>
    {:else if state === "error"}
      <h1>On noes :(</h1>
      <p class="error">
        There was an error joining {name}. Please try again. If this is the
        second time you've tried, please tell the person who invited you. You
        might need a new member invite.
      </p>
      <details>
        {inviteError}
      </details>
    {/if}
  </section>
</div>
