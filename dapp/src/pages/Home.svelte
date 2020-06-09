<script>
  import { authenticate, wallet, role } from "../state/eth";
</script>

{#if !$wallet}
<a on:click={authenticate}>Log in</a>
{/if}

<section>

  {#if $wallet}
  <div>
    <h2>About You</h2>
    <p>You are <strong>member 42</strong>.</p>
    <p>You have <strong>542967</strong> Say. That is <em>12%</em> of the total Say in ParTecK DAO.</p>
    <ul>
      <li>
        <a href="#">Settings</a>
      </li>
      <li>
        <a href="#">Logout</a>
      </li>
    </ul>
  </div>

  {#if $role === 'owner'}
  <div>
    <h2>Administration</h2>
    <p>You are also the <strong>owner of the DAO</strong>. You have special powers to bootstrap the DAO and assign administrative roles.</p>
    <ul>
      <li>
          <a href="#/member/invite">Add a member to the DAO</a>.
      </li>
    </ul>
  </div>
  {/if}
  {/if}

  <div>
    <h2>Members</h2>
    <p>There are currently 42 members of the ParTecK DAO.</p>
    <ul>
      <li>
        <a href="#/members">List members</a>
      </li>
    </ul>
  </div>

  <div>
    <h2>Participate</h2>
    <ul>
      <li>
        <a href="#/polls/open">Open Polls</a>: Show the polls you can vote in right now.
      </li>
      <li>
        <a href="#/polls/create">Upcoming Events</a>: Show upcoming community events.
      </li>
      <li>
        <a href="#/polls/closed">Closed Polls</a>: Show the polls that are now closed.
      </li>
      <li>
        <a href="#/polls/create">Create a Poll</a>: Open a poll for voting by the community.
      </li>
      <li>
        <a href="#/polls/create">Create an Event</a>: Propose an event for the community.
      </li>
    </ul>
  </div>


  <div>
    <h2>What is ParTecK DAO</h2>
    <p>
      ParTecK DAO is an experiment in facilitating group decision-making in
      loosely defined communities.
    </p>
    <ul>
      <li>
        <a href="#/docs/operation.md">Operation</a>
      </li>
      <li>
        <a href="#/docs/principles.md">Principles</a>
      </li>
    </ul>
  </div>

</section>
