<script>
  import Widget from "./Widget.svelte";
  import Item from "src/components/styleguide/Item.svelte";

  const wallet = true;
  const name = "SayDAO";
  const memberId = 666;
</script>

<h2>Welcome</h2>

<Item>
  <Widget
    wallet={true}
    name="SayDAO"
    memberId="666"
    txHash="0x1234"
    networkName="rinkeby"
  />
</Item>
