module.exports = function init(proxyApp) {
    const ytProxy = require("./proxy-main-youtube");
    const ytSimpleProxy = require("./proxy-simple-youtube");
    const {port, proxyPort} = require("../config");
// const harmonInjection = require("./harmon-injection");
// proxyApp.use("/", harmonInjection);
    proxyApp.use((req, res, next) => {
        console.log("url: ", req.url);
        if (!req.url.startsWith("/yts"))
            ytProxy.web(req, res);
        else ytSimpleProxy.web(req, res);
    });

    proxyApp.listen(proxyPort, () => console.log(`YT Proxy listening on port ${port}!`));

};