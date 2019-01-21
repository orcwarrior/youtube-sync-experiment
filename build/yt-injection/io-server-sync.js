import {socket} from "./io-service";
import "../../node_modules/socket-ntp/client/ntp";

let currentSyncOffset = 0;

function ntpInit() {
    ntp.init(socket);
    socket.on("ntp:server_sync", () => {
        setTimeout(() => {
            currentSyncOffset = -ntp.offset();
            console.log("ntp sync: ", currentTimeCorrection);
        }, 30)
    })
} ntpInit();

export {currentSyncOffset}