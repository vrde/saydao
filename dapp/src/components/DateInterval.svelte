<script>
  export let start;
  export let end;

  $: startDate = new Date(start);
  $: endDate = new Date(end);

  const options = {
    year: "numeric",
    month: "short",
    weekday: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };

  function format(start, end) {
    const startString = start.toLocaleDateString(undefined, options);
    let endString;

    // FIXME: I'd like to remove parts of the date, but it's not possible
    if (start.getYear() !== end.getYear()) {
      endString = end.toLocaleDateString(undefined, options);
    } else if (start.getMonth() !== end.getMonth()) {
      endString = end.toLocaleDateString(undefined, options);
    } else if (start.getDate() !== end.getDate()) {
      endString = end.toLocaleDateString(undefined, options);
    } else {
      endString = end.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return startString + "–" + endString;
  }
</script>

{format(startDate, endDate)}
