import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pkg from "../../package.json";

const externalDeps = []; //Object.keys(pkg.dependencies);
export default {
    input: "index.js",
    output: {
        file: "../../client/static/scripts/yt-injection.js",
        format: "cjs",
        name: "yt-injection",
        exports: "named",
    },
    external: externalDeps,
    plugins: [
        nodeResolve({
            jsnext: false,
            main: false,
            jail: "../../node_modules/",
        }),
        commonjs({
            include: ["../../node_modules/**", "./io.events.js"]
        })
        // babel({
        //   exclude: 'node_modules/**' // only transpile our source code
        // })
    ]
};