var mcache = require('memory-cache');

function memoryCache(cacheKey) {

    function cacheGateway(req, res) {
        let key = cacheKey + (req.originalUrl || req.url);
        let cachedBody = mcache.get(key);
        if (cachedBody) {
            console.log("Read from cache: ", key);
            return res.send(cachedBody);
        }
    }

    function cacheWrite(req, res) {
        mcache.put(key, body, duration);
        res.sendResponse(body)
    }

    return {cacheGateway}
}

const cache = (duration) => {
    return (req, res, next) => {
        let key = '__express__' + req.originalUrl || req.url
        let cachedBody = mcache.get(key)
        if (cachedBody) {
            console.log("Read from cache: ", req.originalUrl);
            res.send(cachedBody);
            return;
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                console.warn("Send was called, put in cache!");
                mcache.put(key, body, duration);
                res.sendResponse(body)
            };
            next();
        }
    }
};
module.exports = memoryCache;