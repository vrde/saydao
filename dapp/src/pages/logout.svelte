<script>
  import { push} from 'svelte-spa-router'
  import { logout, wallet } from "../state/eth";
</script>

<section>

  <div>
    <h2>Log out</h2>

    {#if $wallet && $wallet.mnemonic}
    <p>
      <strong>PLEASE NOTE:</strong> If you log out, you will need your <strong>12 magic words</strong> to log in again. If you don't have your magic words, you will not be able to access your account. Your account can be reset, but it may be a slow process.
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
