const config = require("../config");
const harmon = require("harmon");
const addScriptSrc = {
    query: "body", func: (element) => {
        const myScript = `<script src="${config.host}/scripts/yt-injection.js" />`;
        const scriptTagStream = element.createReadStream();
        let ws = element.createWriteStream({outer: false});
        ws.write(myScript);
        scriptTagStream.pipe(ws, {end: false});
        // scriptTagStream.on('end', function () {
        // });

        // element.createWriteStream().end('<div>+ Trumpet</div>');
    }
};
const harmonScriptInjection = harmon([], [addScriptSrc], true);
module.exports = harmonScriptInjection;