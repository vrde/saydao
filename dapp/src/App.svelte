<script>
  import Router from "svelte-spa-router";
  import Header from "./components/Header.svelte";

  import Home from "./pages/Home.svelte";
  import settings from "./pages/settings.svelte";
  import login from "./pages/login.svelte";
  import logout from "./pages/logout.svelte";

  import memberAdd from "./pages/member/add.svelte";
  import memberInvite from "./pages/member/invite.svelte";
  import memberList from "./pages/member/list.svelte";

  import PollsOpen from "./pages/Polls/Open.svelte";
  import PollsClosed from "./pages/Polls/Closed.svelte";
  import PollsCreate from "./pages/Polls/Create.svelte";
  import Docs from "./pages/Docs.svelte";
  import NotFound from "./pages/NotFound.svelte";

  import { clock } from "./state";

  const routes = {
    "/": Home,
    "/settings": settings,
    "/login": login,
    "/logout": logout,
    "/member/add": memberAdd,
    "/member/invite": memberInvite,
    "/member/list": memberList,
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
