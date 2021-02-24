<script>
  import Widget from "./Widget.svelte";
  import Item from "src/components/styleguide/Item.svelte";
</script>

<h2>Header</h2>

<h3>Anonymous user</h3>

<Item>
  <Widget name="SayDAO" memberId={null} shares={0} balance={0} role={null} />
</Item>

<h3>Member</h3>

<Item>
  <Widget
    name="SayDAO"
    memberId={1}
    shares={"22%"}
    balance={12345}
    role="member"
  />
</Item>
