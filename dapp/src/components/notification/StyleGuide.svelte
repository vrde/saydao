<script>
  import Widget from "./Widget.svelte";
  import Item from "src/components/styleguide/Item.svelte";
</script>

<h2>Notification</h2>

<Item>
  <Widget>This is a notification</Widget>
</Item>

<Item>
  <Widget level="error">
    This is an <strong>error</strong> notification
  </Widget>
</Item>

<Item>
  <Widget level="warning">
    This is a <strong>warning</strong> notification
  </Widget>
</Item>

<Item>
  <Widget level="info">
    This is an <strong>info</strong> notification
  </Widget>
</Item>
