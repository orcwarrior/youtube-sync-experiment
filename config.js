const config = {
    port: process.env.PORT || 3000,
    proxyPort: process.env.PROXY_PORT || 3002

};

module.exports = {
    ...config,
    host: process.env.HOST || `http://localhost:${config.port}`
};