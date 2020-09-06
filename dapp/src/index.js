//import { version } from "../package.json";
import App from "./App.svelte";

//window.addEventListener("beforeunload", function(e) {
//  // Cancel the event
//  e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
//  // Chrome requires returnValue to be set
//  e.returnValue = "";
//});

new App({ target: document.body });
