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
  let meetingId = 1;
  let meetingStart = 1613379720000;
  let meetingEnd = 1613380720000;
  let meetingState = "sealed";
  let actionRequired = false;
  let meetingValid = true;
  let open = false;
</script>

<h2>Event Detail page</h2>

<Item>
  <Widget
    {id}
    {title}
    {question}
    {open}
    {meetingId}
    meetingType="online+physical"
    meetingUrl="https://meet.jit.si/saydao"
    meetingAddress="Somewhere in Berlin"
    {meetingStart}
    {meetingEnd}
    {meetingState}
    {meetingValid}
    {actionRequired}
  />
</Item>
