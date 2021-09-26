<script>
  import Widget from "./Widget.svelte";
  import Item from "src/components/styleguide/Item.svelte";

  const wallet = true;
  const handleLogin = () => {};
  const handleSubmit = () => {};
  const name = "SayDAO";
  const inviteMemberId = 666;
</script>

<h2>Join</h2>

<h3>New Member, burner wallet (no native) happy path</h3>

<h4>Waiting for the user to confirm</h4>

<Item>
  <Widget
    {wallet}
    {handleLogin}
    {handleSubmit}
    {inviteMemberId}
    {name}
    memberId={false}
    hasNativeWallet={false}
    loggedIn={false}
    loginError=""
    inviteError=""
    state="idle"
  />
</Item>

<h4>The user confirmed, the transaction is sent but not mined</h4>

<Item>
  <Widget
    {wallet}
    {handleLogin}
    {handleSubmit}
    {inviteMemberId}
    {name}
    memberId={false}
    hasNativeWallet={false}
    loggedIn={false}
    loginError=""
    inviteError=""
    state="working"
  />
</Item>

<h3>New member, Native wallet happy path</h3>

<h4>Waiting to connect to native wallet</h4>

<Item>
  <Widget
    {wallet}
    {handleLogin}
    {handleSubmit}
    {inviteMemberId}
    {name}
    memberId={false}
    hasNativeWallet={true}
    loggedIn={false}
    loginError=""
    inviteError=""
    state="idle"
  />
</Item>

<h3>Errors</h3>

<h4>Invite error</h4>

<Item>
  <Widget
    {wallet}
    {handleLogin}
    {handleSubmit}
    {inviteMemberId}
    {name}
    memberId={false}
    hasNativeWallet={false}
    loggedIn={false}
    loginError=""
    inviteError="The invite is invalid"
    state="error"
  />
</Item>

<h4>Transaction error</h4>

<Item>
  <Widget
    {wallet}
    {handleLogin}
    {handleSubmit}
    {inviteMemberId}
    {name}
    memberId={false}
    hasNativeWallet={false}
    loggedIn={false}
    loginError=""
    inviteError="Transaction failed"
    state="error"
  />
</Item>

<h4>Access to native wallet denied</h4>

<Item>
  <Widget
    {wallet}
    {handleLogin}
    {handleSubmit}
    {inviteMemberId}
    {name}
    memberId={false}
    hasNativeWallet={false}
    loggedIn={false}
    loginError="Access denied"
    inviteError=""
    state="error"
  />
</Item>
