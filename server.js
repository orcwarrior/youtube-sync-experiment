const express = require("express");
const {proxyPort} = require("./config");

// const app = express();
//
// app.use('/node_modules', express.static('node_modules'));
// app.get("/", (req, res) => res.sendFile(`${__dirname}/client/index.html`));
// app.get("/sync", (req, res) => res.sendFile(`${__dirname}/client/sync.html`));

const proxyApp = express();
proxyApp.use("/static", express.static("./client/static"));
const httpServer = require("./server-socketio")(proxyApp, proxyPort);
const ytProxy = require("./proxies/init");
// gVideoProxy.listen(6660);

const gVideoProxy = require("./proxies/proxy-simple-googlevideo");
/*
const fs = require('fs');
const http = require('http');
const pem = require('pem');

pem.createCertificate({ days: 30, selfSigned: true }, function (err, keys) {
    if (err) {throw err}

    const gVideoApp = express();
    gVideoApp.use(gVideoProxy);
    http.createServer({ key: keys.serviceKey, cert: keys.certificate }, gVideoApp).listen(6660);
    // httpsServer
});
*/

// const cacheMiddleware = require("./cache-middleware");
// proxyApp.use(cacheMiddleware(5 * 60 * 1000));

// const cacheMiddleware = require('streaming-cache-middleware');
// proxyApp.use(cacheMiddleware({
//     maxAgeMs: 5 * 60 * 1000,
//     uncacheableRoutePrefixes: ["/watch", ]
//
// }));
proxyApp.use((req, res, next) => {
    if (req.path.startsWith("/g-vid-proxy")) return gVideoProxy(req, res, next);
    else return ytProxy(req, res, next);
});
// proxyApp.use("/g-vid-proxy", gVideoProxy);
httpServer.listen(proxyPort, function () {
    console.log('Youtube sync server listen at: ' + proxyPort);
});
// const credentials = {key: privateKey, cert: certificate, passphrase: "youtubesync"};
// const httpsServer = https.createServer(credentials);

// proxyApp.listen(proxyPort, () => console.log(`YT Proxy listening on port ${port}!`));

// app.listen(port, () => console.log(`Example app listening on port ${port}!`));