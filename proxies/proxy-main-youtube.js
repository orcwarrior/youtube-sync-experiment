const httpProxy = require('http-proxy');
const https = require("https");
const {host, publicHost, proxyPort} = require("../config");
const fs = require("fs");

const ytProxyOpt = {
    target: "https://www.youtube.com/",
    changeOrigin: true,
    followRedirects: true,
    hostRewrite: true,
    // agent: https.globalAgent,
    // headers: {
    //     host: "youtube.com",
    //     accept: "*",
    //     "referer": "http://youtube.com/",
    //     "accept-encoding": "gzip, deflate",
    //     "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
    // },
    // target: "http://localhost:3001/",
    // changeOrigin: true,
    // pathRewrite: {
    //     '^/yt': '',     // rewrite path
    // },
    // router: {
    //     // when request.headers.host == 'dev.localhost:3000',
    //     // override target 'http://www.example.org' to 'http://localhost:8000'
    // },
    cookieDomainRewrite: host,
    logLevel: "debug",
    selfHandleResponse: true,

};
const ytProxy = httpProxy.createProxyServer(ytProxyOpt);

ytProxy.on("proxyRes", onProxyRes);
ytProxy.on("error", (err, req, res) => {
    console.error(err);
    res.end(err)
});
ytProxy.on('proxyReq', function (proxyReq, req, res, options) {
    proxyReq.setHeader('accept-language', req.headers["accept-language"]);
    proxyReq.setHeader('accept-encoding', "identity");
    proxyReq.setHeader('Referer', "youtube.com");
    proxyReq.setHeader('User-Agent', req.headers["user-agent"]);
});

function onProxyRes(proxyRes, req, res) {
    delete proxyRes.headers["x-frame-options"];
    // console.log("proxyRes.headers: ", proxyRes.headers);
    res.set("content-encoding", proxyRes.headers["content-encoding"]);
    const proxyContentType = proxyRes.headers["content-type"];
    res.set("content-type", proxyContentType);
    res.set("content-length", proxyRes.headers["content-length"]);
    res.set("cache-control", proxyRes.headers["cache-control"]);
    res.set("cookie", proxyRes.headers["cookie"]);
    res.set("x-client-data", proxyRes.headers["x-client-data"]);
    res.set("x-yt-proxy", "PROXY-ADVANCED");
    res.set("Access-Control-Allow-Origin", `${host}, youtube.com`);


    if (proxyContentType.startsWith("text/html")) {
        injectCustomCodeIntoMain(res);
    }
    proxyRes.on('data', (data) => {
        res.write(processResponseData(data));
    });
    proxyRes.on('end', (data) => {

        // console.log("proxy res:end", req.url, proxyRes.headers["content-length"]);
        if (proxyContentType.startsWith("text/html")
            && !req.url.includes("/yts/")) {
            // console.log("inject in: ", req.url);
            // setTimeout(() => res.end(`<script src="${config.host}/scripts/yt-injection.js" ></script>`), 100);
            setTimeout(() => res.end(), 1000);
        } else
            setTimeout(() => res.end(), 100);
        // res.end();
    });
}

const htmlInjectFile = fs.readFileSync(`./client/yt-inject.html`, {encoding: "utf8"});
const cssInjectFile = fs.readFileSync(`./client/static/styles/yt-inject.css`, {encoding: "utf8"});

function injectCustomCodeIntoMain(res) {
    // console.log("inecting: ", htmlInjectFile);
    const hostOrigin = `${publicHost}:${proxyPort}`;
    res.write(`<script src="${hostOrigin}/static/scripts/yt-injection.js"></script>`);
    res.write(htmlInjectFile);
    res.write(`<style>${cssInjectFile}</style>`);

}

function processResponseData(data) {
    const dataStr = data.toString("utf8");
    return dataStr
        .replace(new RegExp(`="/yts/`, "g"), "=\"https:\/\/www.youtube.com\/yts\/")
        .replace(`src=\"blob:http://localhost:3002/`, `src=\"blob:https://www.youtube.com/`)
        // .replace(`https://www.youtube.com/get_midroll_info`, `https://www.youtube.com/get_midroll_infoXDXDXD`);
}

// issues:
/* https://www.youtube.com/signin_passive x-frame-options
* */
// Wait until

module.exports = ytProxy;