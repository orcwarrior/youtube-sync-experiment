import {initSyncSession} from "./SyncSession";
import copyToClipboard from "./utils/copyToClipboard";


// document.addEventListener("DOMContentLoaded", () => {
const injectionScope = document.querySelector("#yt-injection-scope");

const syncMenuToggleEl = injectionScope.querySelector("#sync-menu-toggle");
const syncMenu = injectionScope.querySelector(".sync-menu");

const syncSession = initSyncSession();

const syncFormJoinCreateEl = injectionScope.querySelector("#sync-join-create");
const sessionIdInput = injectionScope.querySelector("#sync-channel-id");
const sessionMsOffsetInput = injectionScope.querySelector("#sync-ms-offset");
const shareSessionBtn = injectionScope.querySelector("#sync-share");

shareSessionBtn.addEventListener("click", () => {
    const {origin, pathname, search} = window.location;
    const params = new URLSearchParams(search);
    params.set("syncId", syncSession.sessionId);
    console.log("params with syncId", params.toString());
    const shareUrl = `${origin}${pathname}?${params.toString()}`;
    copyToClipboard(shareUrl);

    // cccruuude
    shareSessionBtn.classList.add("copied");
    setTimeout(() => shareSessionBtn.classList.remove("copied"), 2000);
});
syncMenuToggleEl.addEventListener("click", () => {
    syncMenu.classList.toggle("opened");
    syncMenuToggleEl.classList.toggle("opened");
});
syncFormJoinCreateEl.addEventListener("click", (evt) => {
    const inputSession = sessionIdInput.value;
    evt.preventDefault();
    if (inputSession === syncSession.sessionId)
        syncSession.resetSessionId();
    else
        syncSession.changeSessionId(sessionIdInput.value);
    setTimeout(() => {
        fillSyncData();
        console.log("re-fill inputs with syncId");
    }, 100);
});
sessionIdInput.addEventListener("keyup", _setRegenerateJoinValueOfInputId)

function _setRegenerateJoinValueOfInputId() {
    if (sessionIdInput.value === syncSession.sessionId)
        syncFormJoinCreateEl.value = "Regen. session";
    else
        syncFormJoinCreateEl.value = "Join session";
}

sessionMsOffsetInput.addEventListener("input", () => {
    syncSession.userOffsetMs = Number(sessionMsOffsetInput.value);
});

function fillSyncData() {
    sessionIdInput.value = syncSession.sessionId;
    _setRegenerateJoinValueOfInputId();
}

fillSyncData();


const statusDotEl = injectionScope.querySelector("#sync-status-dot");
syncSession.on("send-sync", () => {
    statusDotEl.classList.add("sended");
    setTimeout(() => statusDotEl.classList.remove("sended"), 50);
})
syncSession.on("sync", () => {
    statusDotEl.classList.add("received");
    setTimeout(() => statusDotEl.classList.remove("received"), 50);
})
// });