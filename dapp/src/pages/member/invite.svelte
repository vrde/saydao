<script>
  import { wallet } from "src/state/eth"
  import { invite } from "src/state/dao"

	import { afterUpdate } from 'svelte';

	afterUpdate(() => {
    if (invitation) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
	});

  let memberId;
  let invitation;

  async function createInvite() {
    const { origin, pathname } = window.location;
    let signature = await invite($wallet, memberId);
    invitation = `${origin}${pathname}#/member/join?memberId=${memberId}&signature=${signature}`;
  }
</script>

<style>
textarea {
  height: var(--size-l);
}

input {
  margin-bottom: var(--size-s);
}
</style>

<h1>Add a member to the DAO</h1>

<h2>How to add a member</h2>

<p>To add a new member, you must generate a <strong>member invite</strong>. A <strong>member invite</strong> is a link you can share with the member you want to invite. The <strong>member invite</strong> can only be used once. Each new member needs their own invite. You can generate as many invites you need.</p>

<fieldset>
  <legend>Invite a member</legend>
  <form on:submit|preventDefault={createInvite}>
    <label>
      Member id to assign
      <input bind:value={memberId} type="number" name="memberId" placeholder="42" required />
    </label>
    <br />
    <button type="submit">Create Invite</button>
  </form>
</fieldset>

{#if invitation}
<div>

  <h2>The invite you requested is ready</h2>

  <p>
    Share this link with the member you want to invite. You can copy and paste it in an email or a message. Here is sample text you can use:
  </p>
  <p>Hello friend! You are invited to join ParTecK DAO. Click the link below and
  </p>
  <p>
     <strong>Important:</strong> The DAO doesn't know the identity of the person connected to a member id. If that is important, you should keep track of what user has what member id yourself.
  </p>

  <textarea readonly>{invitation}</textarea>
</div>
{/if}

<details>
  <summary>How does an invite work?</summary>
  <p>
    An invite can only be used once. It creates one new member id for one person, and then it stops working.
  </p>
</details>
