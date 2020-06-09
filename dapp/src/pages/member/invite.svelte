<script>
  import { wallet } from "src/state/eth"
  import { invite } from "src/state/dao/member"

  let memberId;
  let invitation;

  async function createInvite() {
    const { origin, pathname } = window.location;
    let signature = await invite($wallet, memberId);
    invitation = `${origin}${pathname}#/member/add?memberId=${memberId}&signature=${signature}`;
  }
</script>

<style>
textarea {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  height: 100px;
  display: block;
}
</style>

<h1>Add a member to the DAO</h1>

<h2>How to add a member</h2>

<p>To add a member you need to generate a <strong>member invite</strong>. A <strong>member invite</strong> is a link you share with the member you want to invite. The <strong>member invite</strong> can be used only once and it's connected to a member id. You can generate as many invites you need.</p>

<form on:submit|preventDefault={createInvite}>
  <label>Create an invite for member <input bind:value={memberId} type="number" name="memberId" required />
  <button type="submit">Create Invite</button>
</form>

{#if invitation}
<p>Share the following link with the member you want to invite.</p>

<textarea readonly>{invitation}</textarea>
{/if}
