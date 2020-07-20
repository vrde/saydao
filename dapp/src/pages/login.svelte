<script>
  import {push} from 'svelte-spa-router'
  import { authenticate, wallet, role } from "../state/eth";
  import etherea from "etherea";

  let mnemonic = "";
  let invalidMnemonic;

  async function submitMnemonic() {
    invalidMnemonic = false;
    try {
      await authenticate(mnemonic);
    } catch(e) {
      console.log(e);
      invalidMnemonic = true;
    }
    push('/');
  }

</script>

<section>

  <div>
    <h2>Log in</h2>

    {#if etherea.hasNativeWallet()}

    <p>Your browser supports Ethereum.</p>

    <ul>
      <li>
        <a on:click|preventDefault={authenticate} href="#">Log in with your Ethereum account</a>.
      </li>
    </ul>

    {:else}

    <p>To log in please enter your 12 magic words.</p>

    <ul>
      <li>
        <form on:submit|preventDefault={submitMnemonic}>
          {#if invalidMnemonic}
          <p class="error">It didn't work out. Please double check your 12 magic words.</p>
          {/if}
          <textarea bind:value={mnemonic}></textarea>
          <button type="submit">Log in</button>.
        </form>
      </li>

      <li>
        <a href="mailto:agranzot@mailbox.org?subject=I forgot my 12 magic words">Recover your member account</a>.
      </li>
    </ul>

    {/if}
  </div>

</section>
