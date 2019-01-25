const {port} = require("./config");
const {syncSession} = require("./build/yt-injection/io.events");

let channelsSecrets = {};

module.exports = function initializeIO(expressApp, port = port) {

    const http = require("http").Server(expressApp);
    const io = require('socket.io')(http);
    const ntp = require("socket-ntp");

    io.on('connection', function (socket) {
        // console.log('user connected', socket);
        ntp.sync(socket);

        socket.on(syncSession.register, function ({type, sessionId, id}, typeCorrectionAck = () => {
        }) {
            // TODO: On master disconnect clear master-token
            if (type === "master") {
                if (!channelsSecrets[sessionId]) {
                    console.log(`${sessionId}: socket is master! ${id}`);
                    channelsSecrets[sessionId] = id;
                    socket.on("disconnect", () => {
                        channelsSecrets[sessionId] = undefined;
                        console.warn(`${sessionId}: master disconnected, waiting for other master to connect! ${id}`);
                    })
                }
                else if (channelsSecrets[sessionId] !== id) {
                    console.warn(`${sessionId}: socket tried to be master, degraded! ${id}`);
                    typeCorrectionAck("slave");
                    return socket.join(sessionId);

                } // DK: Don't try to fool me, slave
            }
            console.log(`${sessionId}:(end) socket is ${type}! ${id}`);
            socket.join(sessionId);
            typeCorrectionAck(type);
        });

        socket.on(syncSession.sync, function (syncMsg) {
            if (!syncMsg) return;
            console.log("Got sync msg: ", syncMsg.id);
            const {sessionId, id, date, serverDate, youtubeData} = syncMsg;
            if (id !== channelsSecrets[sessionId]) return console.warn("Wrong master credentials: ", id, channelsSecrets[sessionId]);
            console.log("Sending msg to slaves...", sessionId);
            io.to(sessionId).emit(syncSession.sync, {sessionId, date, serverDate, youtubeData});
        });
    });
    http.listen(port, function () {
        console.log('io listening on: ' + port);
    });
};