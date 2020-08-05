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

<h1>Add a member to ParTecK DAO</h1>

<h2>How to add a member</h2>

<p>To add a new member, you must create a <strong>member invite</strong>. A member invite is a link you can share with the person you want to invite. A member invite can only be used once, so each member needs their own invite. You can generate as many invites you need.</p>

<fieldset>
  <legend>Create a new member invite</legend>
  <form on:submit|preventDefault={createInvite}>
    <label>
      Member id to assign
      <input bind:value={memberId} type="number" name="memberId" placeholder="42" required />
    </label>
    <br />
    <button type="submit">Create member invite</button>
  </form>
</fieldset>

{#if invitation}
<div>

  <h2>The invite you requested is ready</h2>

  <p>
    Share this member invite with the person you want to invite. You can copy and paste it in an email or instant message. Here is sample text you can use:
  </p>
  <p>Hello friend! You are invited to join ParTecK DAO. Click the link below to join.
  </p>
  <p>
     <strong>Note:</strong> ParTecK DAO doesn't collect personal information, so it does not record the identity of the person connected to a member id. If you want to know who each member is, you need to keep track yourself.
  </p>

  <textarea readonly>{invitation}</textarea>
</div>
{/if}

<details>
  <summary>How does a member invite work?</summary>
  <p>
    A member invite allows one new member to join ParTecK DAO. Each member invite can only be used once. It creates one new member id for one person, and then it stops working.
  </p>
</details>
