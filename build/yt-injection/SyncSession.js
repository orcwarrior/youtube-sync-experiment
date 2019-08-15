import uuid from "./utils/uuid";
import EventEmitter from "event-emitter-es6";
import {socket} from "./io";
import {syncSession} from "./io.events";
import doPostSyncTask from "./doPostSyncTask";

const syncTypeEnum = {
    master: "master",
    slave: "slave"
};

const generateSessionId = () => uuid().split("-")[0];
const syncIntervalMs = 3000;


class SyncSession extends EventEmitter {
    static getLSKey() {
        return "SyncSession";
    }

    static clearLSSession() {
        localStorage.removeItem(SyncSession.getLSKey());
    }

    static hasLSSession() {
        return !!localStorage.getItem(SyncSession.getLSKey());
    }

    static deserializeLS() {
        if (!SyncSession.hasLSSession()) return;

        const sessionLS = localStorage.getItem(SyncSession.getLSKey());
        const syncSession = JSON.parse(sessionLS);
        const syncSessionObj = new SyncSession(syncSession.type, syncSession.sessionId,
            syncSession.id, syncSession.userOffsetMs);
        syncSessionObj.serializeInLS();
        return syncSessionObj;

    }

    constructor(syncType = syncTypeEnum.master, sessionId = generateSessionId(), id, userOffsetMs = 0) {
        super();
        this.type = syncType;
        this.sessionId = sessionId;
        this.id = id || uuid(); // id is secret -> it equality authenticate possibility to broadcast sync
        this.lastYoutubeData = [];
        this.userOffsetMs = userOffsetMs;
        this.serializeInLS();

        socket.emit(syncSession.register, {id: this.id, type: syncType, sessionId}, this.receiveRegisterAck.bind(this));

        this.setupSyncSendOrReceive();
        this.initNtpSyncHandler();
        console.log("Sync Session created!", this);
    }

    initNtpSyncHandler() {
        socket.on("ntp:server_sync", () => {
            this.syncOffset = parseInt(-ntp.offset());
            console.log("ntp sync: ", this.syncOffset);
        });
    }

    setupSyncSendOrReceive() {
        this.clearSocketListenersAndEmitters();
        if (this.type === syncTypeEnum.master) {
            console.log("setupSyncSendOrReceive: setup new sync interval");
            this.syncInterval = setInterval(() => socket.emit(syncSession.sync, this.generateSyncMsg()), syncIntervalMs);
        } else {
            console.log("setupSyncSendOrReceive: setup as msg listener...");
            socket.on(syncSession.sync, this.receiveSyncMsg.bind(this));
        }
    }

    clearSocketListenersAndEmitters() {
        if (this.syncInterval) {
            console.log("setupSyncSendOrReceive: removing old sync inverval...");
            clearInterval(this.syncInterval);
        }
        socket.removeAllListeners(syncSession.sync);
    }

    receiveRegisterAck(correctedType) {
        console.log("receiveRegisterAck: ", correctedType, this.type);
        if (this.type !== correctedType) {
            this.type = correctedType;
            this.setupSyncSendOrReceive(); // this call means correcting listen or emit pick
            this.serializeInLS();
        }
    }

    resetSessionId() {
        this.sessionId = generateSessionId();
        this.type = syncTypeEnum.master;
        this.id = uuid();
        this.lastYoutubeData = [];
        console.log("resetSessionId...", this);
        this.setupSyncSendOrReceive();
        this.serializeInLS();
        socket.emit(syncSession.register, this, this.receiveRegisterAck.bind(this));
    }

    changeSessionId(newSessionId) {
        this.sessionId = newSessionId;
        socket.emit(syncSession.register, {
            id: this.id,
            type: this.type,
            sessionId: newSessionId
        }, this.receiveRegisterAck.bind(this));
    }

    generateSyncMsg() {
        this.emit("send-sync");
        const videoEl = document.querySelector(".html5-main-video");
        if (!videoEl) return;

        const {pathname, search} = window.location;
        const {sessionId, id} = this;
        const curDate = new Date();
        const youtubeData = {url: `${pathname}${search}`, videoOffset: videoEl && videoEl.currentTime};
        const syncMsg = {
            sessionId,
            id,
            date: curDate,
            serverDate: ((this.syncOffset || 0) + curDate.valueOf()),
            youtubeData
        };
        // TODO: Get youtube data (url + current ofsset + currentTime) => syncMsg
        console.log("Generate syncMsg: ", syncMsg);
        return syncMsg;
    }

    receiveSyncMsg({sessionId, date, serverDate, youtubeData}) {
        this.emit("sync");
        const {lastYoutubeData, userOffsetMs, syncOffset} = this;
        console.log("receiveSyncMsg!", youtubeData);

        const forceOffseting = (userOffsetMs !== this._lastOffsetMs);
        if (forceOffseting) {
            console.warn("Video offseting will be forced this time");
            this.serializeInLS();
        }
        doPostSyncTask(this, {
            sessionId,
            syncOffset,
            serverDate,
            youtubeData,
            lastYoutubeData,
            userOffsetMs,
            forceOffseting
        });
        this._lastOffsetMs = userOffsetMs;
        this.lastYoutubeData = [youtubeData, ...lastYoutubeData].slice(0, 10);
    }

    serializeInLS() {
        localStorage.setItem(SyncSession.getLSKey(), JSON.stringify(this))
    }
}

let syncInstance = null;

function extractUrlSyncId() {
    const {search} = window.location;
    const searchParams = new URLSearchParams(search);
    return searchParams.get("syncId");
}

const initSyncSession = () => {
    const querySyncSession = extractUrlSyncId();

    if (syncInstance) return syncInstance;
    else if (querySyncSession) syncInstance = new SyncSession(undefined, querySyncSession);
    else if (SyncSession.hasLSSession()) syncInstance = SyncSession.deserializeLS();
    else syncInstance = new SyncSession();
    return syncInstance;
};

export {syncTypeEnum, SyncSession, initSyncSession};