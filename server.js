const express = require("express");

const app = express();
// const {port, proxyPort} = require("./config");


app.use("/static", express.static("./client/static"));
app.use('/node_modules', express.static('node_modules'));
app.get("/", (req, res) => res.sendFile(`${__dirname}/client/index.html`));
app.get("/sync", (req, res) => res.sendFile(`${__dirname}/client/sync.html`));

require("./server-socketio")(app);
const proxyApp = express();
require("./proxies/init")(proxyApp);

// app.listen(port, () => console.log(`Example app listening on port ${port}!`));