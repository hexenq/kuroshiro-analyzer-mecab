"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const acorn = require("acorn");

async function main() {
    const root = path.resolve(__dirname, "..");
    // Check the legacy entry before the root wrapper can modify its exports.
    const Legacy = require(path.join(root, "lib/index.js"));
    assert.equal(typeof Legacy, "function");
    assert.equal(Legacy.default, Legacy);
    const Analyzer = require(root);
    assert.equal(Analyzer, Legacy);
    for (const file of ["index.js", "lib/index.js"]) {
        assert.equal((await import(pathToFileURL(path.join(root, file)))).default, Analyzer);
        acorn.parse(fs.readFileSync(path.join(root, file), "utf8"), { ecmaVersion: 2015 });
    }
    const analyzer = new Analyzer();
    await analyzer.init();
    await assert.rejects(analyzer.init(), /already been initialized/);
    assert.deepEqual(await analyzer.parse(), []);
    assert.deepEqual(await analyzer.parse(""), []);
    assert.deepEqual((await analyzer.parse("  ")).map(token => token.surface_form), [" ", " "]);
    console.log("CommonJS, legacy entry, native ESM and ES2015 package checks passed (no MeCab executable required)");
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
