import {socket} from "./io";
import {initSyncSession} from "./SyncSession";
import "./dom.events";
initSyncSession();

console.log("DK: Code injecton worked as should ;-)");
// console.log("DK: / das ein yt bodt:", document.body);
//
// console.log("DK: Window:", window);

window.orgLocation = window.location.href;
window.orgLocationOrigin = window.location.origin;
const fixedLocation = window.location.href.replace(window.location.origin, "https://www.youtube.com");
window.history.pushState('yt-correction', 'YouTube ', fixedLocation);
setTimeout(() => window.history.pushState('yt-correction-2', 'YouTube ', orgLocation), 1800);

console.log("Corrected location: ", window.location.href);
let printedVidOnce;
window.g = window;

document.addEventListener("keyup", (evt) => {
    if (evt.code === "83") {
        alert("S Clicked!")
    }
    console.log("key clicked");
});
document.addEventListener("DOMContentLoaded", () => {
    correctYTVideoUrl();
    setInterval(correctYTVideoUrl, 200);
    window.history.pushState('yt-correction-2', 'YouTube ', orgLocation)

    function correctYTVideoUrl() {
        // const vid = document.querySelector(".html5-main-video");
        // if (vid) {
        //     vid.src = vid.src.replace("http://localhost:3002/", "https://www.youtube.com/");
        // }


        // const watchLinks = document.querySelectorAll(`a[href^="/watch?"`);
        // watchLinks.forEach(link => {
        //     link.href = `http://localhost:3002${link.href}`
        // });
        // if (watchLinks.length) console.log("DK: Corrected links", watchLinks.length);
    }
});