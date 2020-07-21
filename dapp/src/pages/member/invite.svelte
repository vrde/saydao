<script>
  import { wallet } from "src/state/eth"
  import { invite } from "src/state/dao/member"

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

<p>To add a member you need to generate a <strong>member invite</strong>. A <strong>member invite</strong> is a link you share with the member you want to invite. The <strong>member invite</strong> can be used only once and it's connected to a member id. You can generate as many invites you need.</p>

<fieldset>
  <legend>Invite a member</legend>
  <form on:submit|preventDefault={createInvite}>
    <label>
      Member Id to assign
      <input bind:value={memberId} type="number" name="memberId" placeholder="42" required />
    </label>
    <br />
    <button type="submit">Create Invite</button>
  </form>
</fieldset>

{#if invitation}
<div>

  <h2>The invite is ready</h2>

  <p>
    Share the following link with the member you want to invite. Copy and paste it in an email on in a personal message. <strong>Important:</strong> the DAO doesn't know the identity of the person connected to that member id, you should keep track yourself.
  </p>

  <textarea readonly>{invitation}</textarea>
</div>
{/if}

<details>
  <summary>How does an invite work?</summary>
  <p>
    An invite can be used only once. It activates only one member, and assignes the member id to exactly one person.
  </p>
</details>
