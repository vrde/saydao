<script>
  import CONFIG from "./config";
  import Router from "svelte-spa-router";
  import Header from "./components/Header.svelte";
  import Home from "./pages/Home.svelte";
  import Members from "./pages/Members.svelte";
  import PollsOpen from "./pages/Polls/Open.svelte";
  import PollsClosed from "./pages/Polls/Closed.svelte";
  import PollsCreate from "./pages/Polls/Create.svelte";
  import Docs from "./pages/Docs.svelte";
  import NotFound from "./pages/NotFound.svelte";

  import { clock } from "./state";

  const routes = {
    "/": Home,
    "/members": Members,
    "/polls/open": PollsOpen,
    "/polls/closed": PollsClosed,
    "/polls/create": PollsCreate,
    "/docs/:name": Docs,
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
