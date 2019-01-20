const express = require("express");

const app = express();
app.get("/", (req, res) => {
    res.write("Hello world!\n");
    res.end("I'm out of here");
});
app.listen(3001);