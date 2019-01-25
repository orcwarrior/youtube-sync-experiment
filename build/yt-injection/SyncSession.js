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

function extractUrlSyncId() {
    const {search} = window.location;
    const searchParams = new URLSearchParams(search);
    return searchParams.get("syncId");
}

class SyncSession extends EventEmitter {
    static getLSKey() {
        return "SyncSession";
    }

    static deserializeLS() {
        const sessionLS = localStorage.getItem(SyncSession.getLSKey());
        if (sessionLS) {
            const syncSession = JSON.parse(sessionLS);
            const syncSessionObj = new SyncSession(syncSession.type, extractUrlSyncId() || syncSession.sessionId,
                syncSession.id, syncSession.userOffsetMs);
            syncSessionObj.serializeLS();
            return syncSessionObj;

        } else return new SyncSession();
    }

    constructor(syncType = syncTypeEnum.master, sessionId = generateSessionId(), id, userOffsetMs = 0) {
        super();
        this.type = syncType;
        this.sessionId = sessionId;
        this.id = id || uuid(); // id is secret -> it equality authenticate possibility to broadcast sync
        this.lastYoutubeData = [];
        this.userOffsetMs = userOffsetMs;
        this.serializeLS();

        socket.emit(syncSession.register, {id: this.id, type: syncType, sessionId}, this.receiveRegisterAck.bind(this));

        this.setupSyncSendOrReceive();

        socket.on("ntp:server_sync", () => {
            this.syncOffset = parseInt(-ntp.offset());
            // console.log("ntp sync: ", this.syncOffset);
        })
    }
    setupSyncSendOrReceive() {
        if (this.syncInterval) clearInterval(this.syncInterval);
        if (this.type === syncTypeEnum.master) {
            this.syncInterval = setInterval(() => socket.emit(syncSession.sync, this.generateSyncMsg()), syncIntervalMs);
        } else {
            socket.on(syncSession.sync, this.receiveSyncMsg.bind(this));
        }
    }

    receiveRegisterAck(correctedType) {
        if (this.type !== correctedType) {
            this.type = correctedType;
            this.setupSyncSendOrReceive();
            this.serializeLS();
        }
    }

    changeSessionId(newSessionId) {
        this.sessionId = newSessionId;
        socket.emit(syncSession.register, {id: this.id, type: this.type, sessionId: newSessionId}, this.receiveRegisterAck.bind(this));
    }

    generateSyncMsg() {
        this.emit("send-sync");
        const videoEl = document.querySelector(".html5-main-video");
        if (!videoEl) return;

        const {pathname, search} = window.location;
        const {sessionId, id} = this;
        const curDate = new Date();
        const youtubeData = {url: `${pathname}${search}`, videoOffset: videoEl && videoEl.currentTime};
        const syncMsg = {sessionId, id, date: curDate, serverDate: ((this.syncOffset||0) + curDate.valueOf()), youtubeData};
        // TODO: Get youtube data (url + current ofsset + currentTime) => syncMsg
        console.log("Generate syncMsg: ", syncMsg);
        return syncMsg;
    }

    receiveSyncMsg({sessionId, date, serverDate, youtubeData}) {
        this.emit("sync");
        const {lastYoutubeData, userOffsetMs, syncOffset} = this;
        console.log("receiveSyncMsg!", youtubeData);

        const forceOffseting = (userOffsetMs !== this._lastOffsetMs);
        if (forceOffseting) console.warn("Video offseting will be forced this time");
        doPostSyncTask(this, {sessionId, syncOffset, serverDate, youtubeData, lastYoutubeData, userOffsetMs, forceOffseting});
        this._lastOffsetMs = userOffsetMs;
        this.lastYoutubeData = [youtubeData, ...lastYoutubeData].slice(0, 10);
    }

    serializeLS() {
        localStorage.setItem(SyncSession.getLSKey(), JSON.stringify(this))
    }
}

let syncInstance = null;
const initSyncSession = () => {
    if (syncInstance) return syncInstance;
    else syncInstance = SyncSession.deserializeLS();
    return syncInstance;
};

export {syncTypeEnum, SyncSession, initSyncSession};