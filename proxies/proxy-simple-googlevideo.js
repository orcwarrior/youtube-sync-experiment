const proxy = require('http-proxy-middleware')
const querystring = require("querystring");
// https://r1---sn-hxugv2vgu-ajwe.googlevideo.com/videoplayback?itag=244&ipbits=0&ms=au%2Crdu&mt=1549745787&mv=m&keepalive=yes&source=youtube&clen=18516652&requiressl=yes&mime=video%2Fwebm&txp=5535432&mm=31%2C29&mn=sn-hxugv2vgu-ajwe%2Csn-f5f7lne6&key=yt6&id=o-AD6yFBK_WfmA9s3eDyYr7ysg5B8nE64wielLfu7fWn20&ei=xT5fXMLmCJSzyQWBkKnQBg&initcwndbps=928750&fvip=5&lmt=1549121745181278&beids=9466586&ip=178.217.197.5&sparams=aitags%2Cclen%2Cdur%2Cei%2Cgir%2Cid%2Cinitcwndbps%2Cip%2Cipbits%2Citag%2Ckeepalive%2Clmt%2Cmime%2Cmm%2Cmn%2Cms%2Cmv%2Cpcm2cms%2Cpl%2Crequiressl%2Csource%2Cexpire&gir=yes&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C394%2C395%2C396%2C397&dur=604.503&expire=1549767461&pl=24&c=WEB&pcm2cms=yes&alr=yes&signature=95156C4390825F23BAFF1B1886FCD6E35DB7F50B.D860F37D551244D44F0D74A7DD372992C07BB24D&cpn=gbYiFlliSFK3LCcK&cver=2.20190207&range=0-180264&rn=1&rbuf=0
const proxyOptions = {
    target: "https://www.googlevideo.com/",
    changeOrigin: true,
    followRedirects: true,
    hostRewrite: true,
    logLevel: "debug",
    router: function (req) {
        const [_, gVidProxyPart, orgSubDomain, ...orgPath] = req.path.split("/");
        const origin = `https://${orgSubDomain}.googlevideo.com`;
        const query = (!orgPath[0].startsWith("videoplayback")) && querystring.stringify(req.query, "&", "=", {encodeURIComponent: s => s});
        const proxyTarget = `${origin}/${orgPath}?${query}`; // Query got some checks
        // console.log("router req: ", req.hostname, req.path, ` -> ${proxyTarget}`);

        // console.log("router query: ", query);
        return proxyTarget;
    },
    onProxyRes: function onProxyRes(proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:3002'; // add new header to response
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true'; // add new header to response
        proxyRes.headers['Access-Control-Expose-Headers'] = '*' // add new header to response
        // delete proxyRes.headers['x-removed'] // remove header from response
    }
};
const googleVideoProxy = proxy(proxyOptions);

const googleVideoProxyMiddleware = (req, res, next) => {
    if (req.path.endsWith("generate_204")) {
        // console.warn("Generate 204 path!");
        res.status(204);
        return res.end();
    } else
        return googleVideoProxy(req, res, next);
};
module.exports = googleVideoProxyMiddleware;