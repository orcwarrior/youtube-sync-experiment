module.exports = function initializeIO(expressApp) {

    const {port} = require("./config");
    const http = require("http").Server(expressApp);
    const io = require('socket.io')(http);
    const ntp = require("socket-ntp");

    io.on('connection', function (socket) {
        console.log('user connected', socket);
        ntp.sync(socket);
    });
    http.listen(port, function() {
        console.log('listening on *:' + 3000);
    });
};