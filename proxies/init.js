const ytProxy = require("./proxy-main-youtube");
const ytSimpleProxy = require("./proxy-simple-youtube");
const {port, proxyPort} = require("../config");
// const harmonInjection = require("./harmon-injection");
// proxyApp.use("/", harmonInjection);

const proxyMiddlewareFn = (req, res, next) => {
    // console.log("url: ", req.url);
    if (!req.url.startsWith("/yts") || req.url.endsWith("base.js"))
        ytProxy.web(req, res);
    else ytSimpleProxy.web(req, res);
}

module.exports = proxyMiddlewareFn;