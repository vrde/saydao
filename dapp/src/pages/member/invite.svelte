<script>
  import { wallet } from "src/state/eth";
  import { invite } from "src/state/dao";
  import CONFIG from "src/config";

  import { afterUpdate } from "svelte";

  afterUpdate(() => {
    if (inviteUrl) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  });

  let memberId;
  let invitation;
  let inviteUrl;

  async function createInvite() {
    const { origin, pathname } = window.location;
    let signature = await invite($wallet, memberId);
    inviteUrl = `${origin}${pathname}#/member/join?memberId=${memberId}&signature=${signature}`;
    invitation = `Hello friend!
You are invited to join ${CONFIG.name}. Click the link below to join.

${inviteUrl}`;
  }
</script>

<section>
  <h1>Add a member to {CONFIG.name}</h1>

  <p>
    To add a new member, you must create a <strong>member invite</strong>. A
    member invite is a link you can share with the person you want to invite. A
    member invite can only be used once, so each member needs their own invite.
    You can generate as many invites you need.
  </p>

  <form on:submit|preventDefault={createInvite}>
    <div>
      <label for="member-add">Member id to assign</label>

      <input
        id="member-add"
        bind:value={memberId}
        type="number"
        name="memberId"
        placeholder="42"
        required
      />
    </div>

    <button class="button-shadow" type="submit"
      ><span>Create member invite</span></button
    >
  </form>

  {#if inviteUrl}
    <div>
      <h2>The invite you requested is ready</h2>

      <p>
        Share this member invite with the person you want to invite. You can
        copy and paste it in an email or instant message. Here is sample text
        you can use:
      </p>
      <textarea readonly>{invitation}</textarea>

      <p class="note">
        <strong>Note:</strong>
        {CONFIG.name} doesn't collect personal information, so it does not record
        the identity of the person connected to a member id. If you want to know
        who each member is, you need to keep track yourself.
      </p>
    </div>
  {/if}
</section>
