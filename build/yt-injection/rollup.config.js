import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pkg from "../../package.json";

export default {
    input: "index.js",
    output: {
        file: "../../client/static/scripts/yt-injection.js",
        format: "cjs",
        name: "yt-injection",
        exports: "named",
    },
    external: ["util", ...Object.keys(pkg.dependencies)],
    plugins: [
        nodeResolve({
            name: "logger",
            jsnext: false,
            main: false,
            modulesOnly: true
        }),
        commonjs({})
        // babel({
        //   exclude: 'node_modules/**' // only transpile our source code
        // })
    ]
};