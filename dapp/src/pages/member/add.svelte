<script>
import {parse} from 'qs'
import {querystring} from 'svelte-spa-router'

$: invite = parse($querystring);

let state = "idle";

function handleSubmit() {

}

</script>

<h1>You have been invited to join ParTecK DAO!</h1>

<p>Hi! Someone invited you to join.</p>

<form on:submit={join}>
  <p>I want to join ParTecK DAO with <strong>Member ID {invite.memberId}</strong>.</p>
  <button type="submit">Confirm</button>
</form>
