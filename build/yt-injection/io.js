import io from "../../node_modules/socket.io-client/dist/socket.io.slim";
let socket = io();

import "../../node_modules/socket-ntp/client/ntp";
ntp.init(socket); // init synchronizer

export {socket};