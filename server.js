const express = require("express");

const app = express();


const port = 3000;
const ytProxyPort = 3002;
app.use(express.static("./client/"));
const ytProxy = require("./proxy-main-youtube");
const ytSimpleProxy = require("./proxy-simple-youtube");
const harmonInjection = require("./harmon-injection");

const proxyApp = express();
// proxyApp.use("/", harmonInjection);
proxyApp.use((req, res, next) => {
    console.log("url: ", req.url);
    if (!req.url.startsWith("/yts"))
        ytProxy.web(req, res);
    else ytSimpleProxy.web(req, res);
});

proxyApp.listen(ytProxyPort, () => console.log(`YT Proxy listening on port ${port}!`));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
require("./test-server");