<script>
  import { wallet } from "src/state/eth";
  import { role, memberId, balance, shares, totalMembers } from "src/state/dao";
</script>

<section>

{#if !$wallet}
  <div>
    <h2>Log in or join</h2>
    <p>To participate in the DAO, you need to log in.</p>
    <ul>
      <li>
        <a href="#/login">Log in now</a> if you've already activated your account by using an invite.
      </li>
      <li>
        <a href="mailto:agranzot@mailbox.org?subject=Send me an invite to the DAO">Request an invite</a> if you are a community member but haven't been invited to the DAO.
      </li>
    </ul>
    <p>If you're just looking around, you don't need to log in.</p>
  </div>

  <div>
    <h2>What's up</h2>
    <ul>
      <li>
        <a href="#/polls/open">Open Polls</a>: Show polls you can vote on.
      </li>
      <li>
        <a href="#/polls/create">Upcoming Events</a>: Show upcoming community events.
      </li>
      <li>
        <a href="#/polls/closed">Closed Polls</a>: Show closed polls.
      </li>
    </ul>
  </div>
{:else}

{#if $role.member}
  <div>
    <h2>About you</h2>
    <p>You are <strong>Member {$memberId}</strong>.</p>
    <p>You have <strong>{$balance}</strong> Say. That is <em>{$shares}</em> of the total Say in the DAO.</p>
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
        <a href="mailto:agranzot@mailbox.org?subject=Send me an invite to the DAO">Request an invite</a> if you are a community member but haven't been invited to the DAO.
      </li>
      <li>
        <a href="#/logout">Logout</a>
      </li>
    </ul>
  </div>
{/if}

{#if $role.owner}
  <div>
    <h2>Administration</h2>
    <p>You are the <strong>owner of the DAO</strong>. You have special powers to bootstrap the DAO and assign roles.</p>
    <ul>
      <li>
          <a href="#/member/invite">Add a member to the DAO</a>.
      </li>
    </ul>
  </div>
{/if}

  <div>
    <h2>Members</h2>
    <p>There are currently {$totalMembers} members of theDAO.</p>
    <ul>
      <li>
        <a href="#/member/list">List members</a>
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
{/if}

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
