<script>
  import Widget from "./Widget.svelte";
  import Item from "src/components/styleguide/Item.svelte";

  let id = 1;
  let title = "Organization weekly stammtisch";
  let question = `Welcome to the weekly stammtisch.

Organization organizes the stammtisch **weekly**. This week agenda is:

- Do something about this event that happened.
- Start a synergetic collaboration with those other people.
- Something else.
`;
  let end = 1613360720000;
  let meetingType = "online+physical";
  let meetingUrl = "https://meet.jit.si/saydao";
  let meetingAddress = "Somewhere in Berlin";
  let meetingStart = 1613379720000;
  let meetingEnd = 1613380720000;
  let hasTokens = true;

  const handleSubmit = () => {};
</script>

<h2>Poll detail page</h2>

<h3>Open event poll</h3>
<Item>
  <Widget
    {id}
    {title}
    {question}
    choices={["Yes", "No"]}
    {end}
    hasVotedFor={null}
    hasTokens={true}
    open={true}
    votesPerc={[10, 20]}
    totalVotesPerc={30}
    toQuorum={-50}
    quorumReached={false}
    finalDecision={null}
    isMeeting={true}
    {meetingType}
    {meetingUrl}
    {meetingAddress}
    {meetingStart}
    {meetingEnd}
    meetingSupervisor={1}
    {handleSubmit}
  />
</Item>

<Item>
  <Widget
    {id}
    {title}
    {question}
    choices={["Yes", "No"]}
    {end}
    hasVotedFor={1}
    {hasTokens}
    open={true}
    votesPerc={[40, 20]}
    totalVotesPerc={60}
    toQuorum={-10}
    quorumReached={true}
    finalDecision={0}
    isMeeting={true}
    {meetingType}
    {meetingUrl}
    {meetingAddress}
    {meetingStart}
    {meetingEnd}
    meetingSupervisor={1}
    {handleSubmit}
  />
</Item>
