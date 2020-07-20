<script>
  import { push} from 'svelte-spa-router'
  import { logout, wallet } from "../state/eth";
</script>

<section>

  <div>
    <h2>Log out</h2>

    {#if $wallet && $wallet.mnemonic}
    <p>
      Important! Before logging out, you should save somewhere your personal <strong>12 magic words</strong>. Those 12 magic words will allow to log in again. If you lose them, you will have to recover your account and it might take some time.
    </p>

    <p>Your 12 magic words are:</p>

    <textarea readonly>{$wallet.mnemonic}</textarea>
    {/if}

    <p>Are you sure you want to log out?</p>

    <button on:click={()=>logout() && push('/')}>
      Log me out
    </button>

  </div>

</section>
