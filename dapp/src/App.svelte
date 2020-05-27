<script>
  import CONFIG from "./config";
  import Router from "svelte-spa-router";
  import Header from "./components/Header.svelte";
  import Home from "./pages/Home.svelte";
  import NotFound from "./pages/NotFound.svelte";

  import { clock } from "./state";

  const routes = {
    "/": Home,
    "*": NotFound
  };
</script>

<style>
</style>

<Header />

<main>
  <Router {routes} />
</main>
<hr />
<footer>production: {CONFIG.production}, built on: {CONFIG.date}</footer>
