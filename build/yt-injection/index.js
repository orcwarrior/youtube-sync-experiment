import {socket} from "./io-service";
import {currentSyncOffset} from "./io-server-sync";

console.log("DK: Code injecton worked as should ;-)");
console.log("DK: / das ein yt bodt:", document.body);

console.log("DK: Window:", window);

const orgLocation = window.location.href;
const fixedLocation = window.location.href.replace("http://localhost:3002", "https://www.youtube.com");
window.history.pushState('yt-correction', 'YouTube ', fixedLocation);
setTimeout(() => window.history.pushState('yt-correction-2', 'YouTube ', orgLocation), 500);

console.log("Corrected location: ", window.location.href);
let printedVidOnce;
window.g = window;
setInterval(() => {
    const vid = document.querySelector(".html5-main-video");
    if (vid) {
        console.log("vid.currentTime: ", vid.currentTime);
        console.log("vid.id:", window.location.search.split("=")[1]);
        if (!printedVidOnce) {
            printedVidOnce = true;
        }
    }
    else console.log("No video still...")
}, 3240);

document.addEventListener("keyup", (evt) => {
    if (evt.code === "83") {
        alert("S Clicked!")
    }
    console.log("key clicked");
});
document.addEventListener("DOMContentLoaded", () => {
    // correctWatchLinks();
    // setInterval(correctWatchLinks, 200);
    window.history.pushState('yt-correction-2', 'YouTube ', orgLocation)

    function correctWatchLinks() {
        const watchLinks = document.querySelectorAll(`a[href^="/watch?"`);
        watchLinks.forEach(link => {
            link.href = `http://localhost:3002${link.href}`
        });
        if (watchLinks.length) console.log("DK: Corrected links", watchLinks.length);
    }
});