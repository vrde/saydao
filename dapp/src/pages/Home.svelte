<script>
  import { authenticate } from "../state/eth";
</script>

<h1>Welcome to ParTecK DAO</h1>

<a on:click={authenticate}>Log in</a>

<section>
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

  <div>
    <h2>About You</h2>
    <p>You are <strong>member 42</strong>. You own <strong>542967</strong> SAY tokens, <em>12%</em> of the total.</p>
    <ul>
      <li>
        <a href="#">Settings</a>
      </li>
      <li>
        <a href="#">Logout</a>
      </li>
    </ul>
  </div>

  <div>
    <h2>Members</h2>
    <p>There are currenty 42 members participating to the DAO.</p>
    <ul>
      <li>
        <a href="#/members">List members</a>
      </li>
    </ul>
  </div>

  <div>
    <h2>Polls</h2>
    <p>Polls allow members to participate in the organization.</p>
    <ul>
      <li>
        <a href="#/polls/open">Open Polls</a>
      </li>
      <li>
        <a href="#/polls/closed">Closed Polls</a>
      </li>
      <li>
        <a href="#/polls/create">Create a Poll</a>
      </li>
    </ul>
  </div>

  <div>
    <h2>Events</h2>
    <p>Events something something</p>
    <ul>
      <li>
        <a href="">Proposed Events</a>
      </li>
      <li>
        <a href="">Something</a>
      </li>
      <li>
        <a href="">Create a Poll</a>
      </li>
    </ul>
  </div>
</section>
