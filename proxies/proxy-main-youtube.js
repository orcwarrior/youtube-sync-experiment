const httpProxy = require('http-proxy');
const https = require("https");
const {host, publicHost, proxyPort} = require("../config");
const fs = require("fs");
const keepAliveAgent = new https.Agent({keepAlive: true});

const ytProxyOpt = {
    target: "https://www.youtube.com/",
    changeOrigin: true,
    followRedirects: true,
    hostRewrite: true,
    agent: keepAliveAgent,
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
    res.end(JSON.stringify(err))
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


    if (proxyContentType.startsWith("text/html") &&
        (req.path.startsWith("/watch") || req.path === "/")) {
        console.log("Inject custom script into main!");
        injectCustomCodeIntoMain(res);
    }
    proxyRes.on('data', (data) => {
        res.write(processResponseData(data, req));
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
const jsInjectFile = fs.readFileSync(`./client/static/scripts/yt-injection.js`, {encoding: "utf8"});
const cssInjectFile = fs.readFileSync(`./client/static/styles/yt-inject.css`, {encoding: "utf8"});

function injectCustomCodeIntoMain(res) {
    // console.log("inecting: ", htmlInjectFile);
    const hostOrigin = `${publicHost}:${proxyPort}`;
    // res.write(`<script src="${hostOrigin}/static/scripts/yt-injection.js"></script>`);
    res.write(`<script>${jsInjectFile}</script>`);
    res.write(htmlInjectFile);
    res.write(`<style>${cssInjectFile}</style>`);
}

//       , Dea = /^((http(s)?):)?\/\/((((lh[3-6](-tt|-d[a-g,z])?\.((ggpht)|(googleusercontent)|(google)))|(([1-4]\.bp\.blogspot)|(bp[0-3]\.blogger))|((((cp|ci|gp)[3-6])|(ap[1-2]))\.(ggpht|googleusercontent))|(gm[1-4]\.ggpht)|(((yt[3-4])|(sp[1-3]))\.(ggpht|googleusercontent)))\.com)|(dp[3-6]\.googleusercontent\.cn)|(dp4\.googleusercontent\.com)|(photos\-image\-(dev|qa)(-auth)?\.corp\.google\.com)|((dev|dev2|dev3|qa|qa2|qa3|qa-red|qa-blue|canary)[-.]lighthouse\.sandbox\.google\.com\/image)|(image\-(dev|qa)\-lighthouse(-auth)?\.sandbox\.google\.com(\/image)?))\/|^https?:\/\/(([A-Za-z0-9-]{1,63}\.)*(corp\.google\.com|c\.googlers\.com|borg\.google\.com|docs\.google\.com|drive\.google\.com|googleplex\.com|googlevideo\.com|play\.google\.com|prod\.google\.com|lh3\.photos\.google\.com|plus\.google\.com|mail\.google\.com|youtube\.com|xfx7\.com|yt\.akamaized\.net|chat\.google\.com)(:[0-9]+)?\/|([A-Za-z0-9-]{1,63}\.)*(sandbox\.google\.com)(:[0-9]+)?\/(?!url\b)|([A-Za-z0-9-]{1,63}\.)*c\.lh3(-d[a-gz])?\.(googleusercontent|photos\.google)\.com\/.*$)/
function processResponseData(data, {path}) {
    // console.warn("path: ", path);
    if (path.startsWith("/watch") || path === "/") return processMainHTMLFiles(data);
    else if (path.endsWith("base.js")) return processBaseJSFile(data)
    else return data;


    function processMainHTMLFiles(data) {
        const dataStr = data.toString("utf8");
        return dataStr
        // {\"url\":\"\/\/www.youtube.com\/get_end
        // .replace(new RegExp(`="/yts/`, "g"), "=\"https:\/\/www.youtube.com\/yts\/")
        //     .replace("youtube.com", "localhost:3002")
            .replace("https://www.youtube.com", "http://localhost:3002")
            .replace("https:\\/\\/www.youtube.com", "http:\\/\\/localhost:3002")
            // .replace("youtube.com", "localhost:3002")
            // .replace(`src=\"blob:http://localhost:3002/`, `src=\"blob:https://www.youtube.com/`)
            .replace(/https:\/\/(.+)\.googlevideo\.com\//gi, `http://localhost:3002/g-vid-proxy/\$1/`)
            .replace("https:\\/\\/s.ytimg.com\\/yts\\/htmlbin\\/desktop_polymer_sel_auto_svg_watch", "http:\\/\\/localhost:3002\\/yts\\/htmlbin\\/desktop_polymer_sel_auto_svg_watch")
            .replace(/https:\\\/\\\/(.+)\.googlevideo\.com\//gi, `http:\\/\\/localhost:3002/g-vid-proxy/\$1/`)
            .replace(/https%3A%2F%2F(.+)\.googlevideo\.com%2F/gi, `http%3A%2F%2Flocalhost%3A3002%2Fg-vid-proxy%2F\$1%2F`)
        //https:\/\/r3---sn-hxugv2vgu-ajwe.googlevideo.com\/videoplaybac
    }

    function processBaseJSFile(data) {
        const secureYTUrlRegex = "/^((http(s)?):)?\\/\\/((((lh[3-6](-tt|-d[a-g,z])?\\.((ggpht)|(googleusercontent)|(google)))|(([1-4]\\.bp\\.blogspot)|(bp[0-3]\\.";
        // console.warn("processing base.js file!!!");
        const dataStr = data.toString("utf8");
        return dataStr
            .replace(secureYTUrlRegex, `/.*/; __DK__disabledRgx = /${secureYTUrlRegex}`)
            .replace(/\/\^https\?/g, "/.*/; __DK3__disabledRgx = /^https?")
            // .replace(new RegExp(`="/yts/`, "g"), "=\"https:\/\/www.youtube.com\/yts\/")
            // .replace("/^https?:\\/\\/", "/.*/; __DK2__disabledRgx = /^https?:\\/\\/")
            .replace("En=function(a,b){", "En = function(a, b) { console.log('en.fn: ', a, b); ");
    }
}

// issues:
/* https://www.youtube.com/signin_passive x-frame-options
* */
// Wait until

module.exports = ytProxy;