const httpProxy = require('http-proxy');
const config = require("../config");

const ytSimpleProxyOpt = {
    target: "https://www.youtube.com/",
    changeOrigin: true,
    followRedirects: true,
    hostRewrite: true,
    cookieDomainRewrite: config.host,
    logLevel: "debug",

};
const ytSimpleProxy = httpProxy.createProxyServer(ytSimpleProxyOpt);

ytSimpleProxy.on("proxyRes", onProxyRes);
ytSimpleProxy.on("error", (err, req, res) => {
    console.error(err);
    res.end(err)
});
ytSimpleProxy.on('proxyReq', function (proxyReq, req, res, options) {
    proxyReq.setHeader('accept-language', req.headers["accept-language"]);
    proxyReq.setHeader('accept-encoding', "identity");
    proxyReq.setHeader('Referer', "youtube.com");
    proxyReq.setHeader('User-Agent', req.headers["user-agent"]);
});

function onProxyRes(proxyRes, req, res) {
    res.set("content-encoding", proxyRes.headers["content-encoding"]);
    const proxyContentType = proxyRes.headers["content-type"];
    res.set("content-type", proxyContentType);
    res.set("content-length", proxyRes.headers["content-length"]);
    res.set("cache-control", proxyRes.headers["cache-control"]);
    res.set("cookie", proxyRes.headers["cookie"]);
    res.set("x-client-data", proxyRes.headers["x-client-data"]);
    res.set("x-yt-proxy", "PROXY-SIMPLE");
    res.set("Access-Control-Allow-Origin", `${config.host}, youtube.com`);
}

// issues:
/* https://www.youtube.com/signin_passive x-frame-options
* */


module.exports = ytSimpleProxy;