<script>
  import DOMPurify from "dompurify";
  import marked from "marked";
  export let params = {};
  const content = fetch("docs/" + params.name);
</script>

{#await content then md}
  {#await md.text() then text}
    {@html DOMPurify.sanitize(marked(text))}
  {/await}
{/await}
