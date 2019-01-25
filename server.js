const express = require("express");
const {proxyPort} = require("./config");

// const app = express();
//
// app.use('/node_modules', express.static('node_modules'));
// app.get("/", (req, res) => res.sendFile(`${__dirname}/client/index.html`));
// app.get("/sync", (req, res) => res.sendFile(`${__dirname}/client/sync.html`));

const proxyApp = express();
proxyApp.use("/static", express.static("./client/static"));
require("./server-socketio")(proxyApp, proxyPort);
require("./proxies/init")(proxyApp);
// proxyApp.listen(proxyPort, () => console.log(`YT Proxy listening on port ${port}!`));

// app.listen(port, () => console.log(`Example app listening on port ${port}!`));