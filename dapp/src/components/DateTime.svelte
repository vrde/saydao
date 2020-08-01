<script>
  import { onMount } from "svelte";

  export let date = new Date();
  export let countdown = false;

  let timeLeft;

  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  };

  function format(date) {
    return date.toLocaleDateString(undefined, options);
  }

  // Thanks: https://stackoverflow.com/a/52387803
  function secondsToDHMS(seconds) {
    var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds % (3600*24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h + (h == 1 ? " hour, " : " hours, ");
    var mDisplay = m + (m == 1 ? " minute, " : " minutes, ");
    var sDisplay = s + (s == 1 ? " second" : " seconds");
    return dDisplay + hDisplay + mDisplay + sDisplay;
  }


  onMount(() => {
    function tick() {
      const total = (date - new Date()) / 1000;
      timeLeft = Math.round(total);
    }

    let timerId;
    if (countdown) {
      tick();
      timerId = setInterval(tick, 1000);
    }
    return () => timerId !== undefined && clearInterval(timerId);
  });

</script>

{format(date)}
{#if countdown}
  (time left: {secondsToDHMS(timeLeft)})
{/if}
