import {initSyncSession} from "./SyncSession";
document.addEventListener("DOMContentLoaded", () => {
    const injectionScope = document.querySelector("#yt-injection-scope");

    const syncMenuToggleEl = injectionScope.querySelector("#sync-menu-toggle");
    const syncMenu = injectionScope.querySelector(".sync-menu");

    const syncSession = initSyncSession();

    const syncFormJoinCreateEl = injectionScope.querySelector("#sync-join-create");
    const sessionIdInput = injectionScope.querySelector("#sync-channel-id");
    const sessionMsOffsetInput = injectionScope.querySelector("#sync-ms-offset");

    syncMenuToggleEl.addEventListener("click", () => {
        syncMenu.classList.toggle("opened");
        syncMenuToggleEl.classList.toggle("opened");
    });
    syncFormJoinCreateEl.addEventListener("click", (evt) => {
        evt.preventDefault();
        syncSession.changeSessionId(sessionIdInput.value);
    });
    sessionMsOffsetInput.addEventListener("input", () => {
        syncSession.userOffsetMs = Number(sessionMsOffsetInput.value);
    });

    function fillSyncData() {
        sessionIdInput.value = syncSession.sessionId;
    } fillSyncData();

    const statusDotEl = injectionScope.querySelector("#sync-status-dot");
    syncSession.on("send-sync", () => {
        statusDotEl.classList.add("sended");
        setTimeout(() => statusDotEl.classList.remove("sended"), 50);
    })
    syncSession.on("sync", () => {
        statusDotEl.classList.add("received");
        setTimeout(() => statusDotEl.classList.remove("received"), 50);
    })
});