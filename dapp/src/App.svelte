<script>
  import Router, { location } from "svelte-spa-router";
  import Notification from "src/components/notification";
  import Header from "./components/header";

  import StyleGuide from "./pages/styleguide";
  import Home from "./pages/Home.svelte";
  import settings from "./pages/settings.svelte";
  import login from "./pages/login.svelte";
  import logout from "./pages/logout.svelte";

  import memberJoin from "./pages/member/join";
  import memberWelcome from "./pages/member/welcome";
  import memberInvite from "./pages/member/invite.svelte";
  import memberList from "./pages/member/list.svelte";

  import PollsOpen from "./pages/Polls/Open.svelte";
  import PollsClosed from "./pages/Polls/Closed.svelte";
  import PollsCreate from "./pages/Polls/Create.svelte";
  import PollsDetails from "./pages/Polls/details";

  import MeetingsCreate from "./pages/Meetings/Create.svelte";
  import MeetingsDetails from "./pages/Meetings/details";
  import MeetingsUpcoming from "./pages/Meetings/Upcoming.svelte";
  import MeetingsPast from "./pages/Meetings/Past.svelte";

  import Docs from "./pages/Docs.svelte";
  import NotFound from "./pages/NotFound.svelte";

  $: showHeader = !["/member/join", "/member/welcome"].some((path) =>
    $location.startsWith(path)
  );

  const routes = {
    "/": Home,
    "/styleguide": StyleGuide,
    "/settings": settings,
    "/login": login,
    "/logout": logout,

    "/member/join": memberJoin,
    "/member/welcome": memberWelcome,
    "/member/invite": memberInvite,
    "/member/list": memberList,

    "/events/create": MeetingsCreate,
    "/events/details/:id": MeetingsDetails,
    "/events/upcoming": MeetingsUpcoming,
    "/events/past": MeetingsPast,

    "/polls/open": PollsOpen,
    "/polls/closed": PollsClosed,
    "/polls/create": PollsCreate,
    "/polls/details/:id": PollsDetails,

    "/docs/:name": Docs,
    "*": NotFound,
  };
</script>

<Notification />
{#if showHeader}
  <Header />
{/if}
<Router {routes} />
