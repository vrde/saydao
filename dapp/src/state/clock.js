import { writable } from "svelte/store";

export const clock = writable(Date.now());

(() => {
  let intervalId;

  function toggle(visibility) {
    if (visibility === "hidden") {
      clearInterval(intervalId);
      intervalId = undefined;
    } else if (visibility === "visible" && intervalId === undefined) {
      intervalId = setInterval(() => clock.set(Date.now()), 1000);
    }
  }

  toggle("visible");
  console.log("Start clock");

  document.addEventListener("visibilitychange", () =>
    toggle(document.visibilityState)
  );
})();
