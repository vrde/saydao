<script>
  import { wallet } from "src/state/eth";
  import { role, memberId, balance, shares, totalMembers } from "src/state/dao";
</script>

<section>

{#if !$wallet}
  <div>
    <h2>Log in</h2>
    <p>To participate in ParTecK DAO, you need to log in.</p>
    <ul>
      <li>
        <a href="#/login">Log in now</a> if you've already joined.
      </li>
      <li>
        <a href="mailto:agranzot@mailbox.org?subject=Invite me to ParTecK DAO">Request an invite</a> if you are a ParTecK member and want to join.
      </li>
    </ul>
    <p>If you're just looking around, you don't need to log in.</p>
  </div>

  <div>
    <h2>Participate</h2>
    <ul>
      <li>
        <a href="#/events/upcoming">Upcoming events</a>: Show upcoming ParTecK events.
      </li>
      <li>
        <a href="#/polls/open">Open polls</a>: Show polls you can vote on.
      </li>
      <li>
        <a href="#/polls/closed">Closed polls</a>: Show polls that are now closed.
      </li>
    </ul>
  </div>
{:else}

{#if $role.member}
  <div>
    <h2>About you</h2>
    <p>You are <strong>member {$memberId}</strong>.</p>
    <p>You have <strong>{$balance}</strong> Say. That is <em>{$shares}</em> of the total Say in ParTecK DAO.</p>
    <ul>
      <li>
        <a href="#/settings">Settings</a>
      </li>
      <li>
        <a href="#/logout">Logout</a>
      </li>
    </ul>
  </div>
{:else}
  <div>
    <h2>About you</h2>
    <p>You are <strong>logged in</strong> but you are not a member.</p>
    <ul>
      <li>
        <a href="mailto:agranzot@mailbox.org?subject=Invite me to ParTecK DAO">Request an invite</a> if you are a ParTecK member and want to join.
      </li>
      <li>
        <a href="#/logout">Sign out</a>
      </li>
    </ul>
  </div>
{/if}

{#if $role.owner}
  <div>
    <h2>Administration</h2>
    <p>You are an <strong>admin for ParTecK DAO</strong>. You have special powers. Use them wisely.</p>
    <ul>
      <li>
          <a href="#/member/invite">Add a member to ParTecK DAO</a>.
      </li>
    </ul>
  </div>
{/if}

  <div>
    <h2>Members</h2>
    <p>There are currently {$totalMembers} members of ParTecK DAO.</p>
    <ul>
      <li>
        <a href="#/member/list">List members</a>
      </li>
    </ul>
  </div>

  <div>
    <h2>Participate</h2>
    <h3>Events</h3>
    <ul>
      <li>
        <a href="#/events/upcoming">Upcoming events</a>: Show upcoming ParTecK events.
      </li>
      <li>
        <a href="#/events/past">Past events</a>: Show past ParTecK events.
      </li>
      <li>
        <a href="#/events/create">Create an event</a>: Propose a new ParTecK event.
      </li>
    </ul>
    <h3>Polls</h3>
    <ul>
      <li>
        <a href="#/polls/open">Open polls</a>: Show polls you can vote on.
      </li>
      <li>
        <a href="#/polls/closed">Closed polls</a>: Show polls that are now closed.
      </li>
      <li>
        <a href="#/polls/create">New poll</a>: Open a poll for ParTecK to vote on.
      </li>
    </ul>
  </div>
{/if}

  <div>
    <h2>What is ParTecK DAO</h2>
    <p>
      ParTecK DAO is an experiment in facilitating group decision-making in
      loosely defined communities. Find out more:
    </p>
    <ul>
      <li>
        <a href="#/docs/operation.md">See how ParTecK DAO works.</a>
      </li>
      <li>
        <a href="#/docs/principles.md">Read our design principles.</a>
      </li>
    </ul>
  </div>

</section>
