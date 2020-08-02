<script>
  import Router from "svelte-spa-router";
  import Header from "./components/Header.svelte";

  import Home from "./pages/Home.svelte";
  import settings from "./pages/settings.svelte";
  import login from "./pages/login.svelte";
  import logout from "./pages/logout.svelte";

  import memberJoin from "./pages/member/join.svelte";
  import memberWelcome from "./pages/member/welcome.svelte";
  import memberInvite from "./pages/member/invite.svelte";
  import memberList from "./pages/member/list.svelte";

  import PollsOpen from "./pages/Polls/Open.svelte";
  import PollsClosed from "./pages/Polls/Closed.svelte";
  import PollsCreate from "./pages/Polls/Create.svelte";
  import PollsCreateMeeting from "./pages/Polls/CreateMeeting.svelte";
  import PollsDetails from "./pages/Polls/Details.svelte";
  import Docs from "./pages/Docs.svelte";
  import NotFound from "./pages/NotFound.svelte";

  import { clock } from "./state";

  const routes = {
    "/": Home,
    "/settings": settings,
    "/login": login,
    "/logout": logout,
    "/member/join": memberJoin,
    "/member/welcome": memberWelcome,
    "/member/invite": memberInvite,
    "/member/list": memberList,
    "/polls/open": PollsOpen,
    "/polls/closed": PollsClosed,
    "/polls/create": PollsCreate,
    "/polls/create-event": PollsCreateMeeting,
    "/polls/details/:id": PollsDetails,
    "/docs/:name": Docs,
    "*": NotFound
  };
</script>

<style>

</style>

<Header />

<main>
  <section>
    <Router {routes} />
  </section>
</main>
<footer></footer>
