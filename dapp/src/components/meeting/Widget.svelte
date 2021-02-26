<script>
  import DOMPurify from "dompurify";
  import marked from "marked";
  import DateInterval from "src/components/DateInterval.svelte";

  // `id` is the id of the poll
  export let id;
  // `title` is the title of the poll
  export let title;
  // `question` is the question of the poll
  export let question;
  // `meetingId` is the id of the meeting
  export let meetingId;
  // `meetingType` can be `online`, `physical`, `online+physical`
  export let meetingType;
  // `meetingUrl` links to the online meeting if any
  export let meetingUrl;
  // `meetingAddress` contains the actual address of the event
  export let meetingAddress;
  // `meetingStart` is the proposed start of the event/meeting
  export let meetingStart;
  // `meetingEnd` is the proposed end of the event/meeting
  export let meetingEnd;
  // `highlight` should the event be highlighted
  export let highlight = false;
</script>

<style>
  .highlight {
    background-color: var(--color-event);
  }
  .widget {
    padding: var(--size-xl) 0;
  }

  section {
    padding-top: var(--size-s);
    padding-bottom: var(--size-s);
  }

  h2 {
    font-size: var(--size);
    margin: 0;
  }

  h3 {
    font-size: var(--size-l);
    margin-top: 0;
    margin-bottom: var(--size);
  }

  .metadata {
    font-style: italic;
    margin-top: 0;
  }
</style>

<div class="widget" class:highlight>
  {#if highlight}
    <section>
      <h2>Upcoming event</h2>
    </section>
  {/if}

  <section>
    <h3><a href="#/events/details/{meetingId}">{title}</a></h3>
    <p class="metadata">
      <DateInterval start={meetingStart} end={meetingEnd} />
    </p>
    <!--
    <p>
      The event happens between
      <br />
      {#if meetingType === "online"}
        The event is online only.
      {:else if meetingType === "physical"}
        The event is in person only.
      {:else if meetingType === "online+physical"}
        The event is both online and in person.
      {/if}
    </p>
    {#if meetingUrl || meetingAddress}
      <ul>
        {#if meetingUrl}
          <li>Join online at <a href={meetingUrl}>{meetingUrl}</a></li>
        {/if}
        {#if meetingAddress}
          <li>Join in person at <strong>{meetingAddress}</strong></li>
        {/if}
      </ul>
    {/if}
    -->
    <div class="question">
      {@html DOMPurify.sanitize(marked(question))}
    </div>
  </section>

  <section>
    <a class="button-shadow" href="#/events/details/{meetingId}">
      <span>Event details →</span>
    </a>
  </section>
</div>
