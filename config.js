const config = {
    port: process.env.PORT || 3000,
    proxyPort: process.env.PROXY_PORT || 3002,
    publicHost: process.env.PUBLIC_IP || "localhost"

};

module.exports = {
    ...config,
    host: process.env.HOST || `http://localhost:${config.port}`,
    hostProxy: process.env.HOST_PROXY || `http://localhost:${config.proxyPort}`
};