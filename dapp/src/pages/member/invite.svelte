<script>
  import { wallet } from "src/state/eth";
  import { invite, recover } from "src/state/dao";
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

  let memberIdRecover;
  let recovery;
  let recoverUrl;

  async function createInvite() {
    const { origin, pathname } = window.location;
    let signature;
    try {
      signature = await invite($wallet, memberId);
    } catch (e) {
      alert(e.toString());
      throw e;
    }
    inviteUrl = `${origin}${pathname}#/member/join?memberId=${memberId}&signature=${signature}`;
    invitation = `Hello friend!
You are invited to join ${CONFIG.name}. Click the link below to join.

${inviteUrl}`;
  }

  async function createRecovery() {
    const { origin, pathname } = window.location;
    const memberAddress = await $wallet.contracts.SayDAO.memberToAddress(
      memberIdRecover
    );
    let signature;
    try {
      signature = await recover($wallet, memberIdRecover);
    } catch (e) {
      alert(e.toString());
      throw e;
    }
    recoverUrl = `${origin}${pathname}#/member/recover?memberAddress=${memberAddress}&signature=${signature}`;
    recovery = `Hello member!
This is your recovery link for ${CONFIG.name}. Click the link below to recover your account.

${recoverUrl}`;
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
        autocomplete="off"
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

<section>
  <h1>Recover a member's account</h1>

  <form on:submit|preventDefault={createRecovery}>
    <div>
      <label for="member-add">Member id to recover</label>

      <input
        id="member-recover"
        bind:value={memberIdRecover}
        type="text"
        name="memberIdRecover"
        placeholder="42"
        autocomplete="off"
        required
      />
    </div>

    <button class="button-shadow" type="submit"
      ><span>Recover member</span></button
    >
  </form>

  {#if recoverUrl}
    <div>
      <h2>The recovery link is ready</h2>

      <p>
        Share this recovery link with the member who lost their seedphrase. You
        can copy and paste it in an email or instant message. Here is sample
        text you can use:
      </p>
      <textarea readonly>{recovery}</textarea>
    </div>
  {/if}
</section>
