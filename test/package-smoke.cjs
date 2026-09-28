"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const installPackedPackage = require("./packed-package.cjs");
const { pathToFileURL } = require("node:url");
const acorn = require("acorn");

async function main() {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), "mecab-package-"));
    try {
        const metadata = installPackedPackage(path.resolve(__dirname, ".."), temp);
        const root = path.join(temp, "node_modules", metadata.name);
        // Check the legacy entry before the root wrapper can modify its exports.
        const Legacy = require(path.join(root, "lib/index.js"));
        assert.equal(typeof Legacy, "function");
        assert.equal(Legacy.default, Legacy);
        const Analyzer = require(root);
        assert.equal(Analyzer, Legacy);
        for (const file of ["index.js", "lib/index.js"]) {
            assert.equal((await import(pathToFileURL(path.join(root, file)))).default, Analyzer);
            acorn.parse(fs.readFileSync(path.join(root, file), "utf8"), { ecmaVersion: 2022 });
        }
        const analyzer = new Analyzer();
        await analyzer.init();
        await assert.rejects(analyzer.init(), /already been initialized/);
        assert.deepEqual(await analyzer.parse(), []);
        assert.deepEqual(await analyzer.parse(""), []);
        assert.deepEqual((await analyzer.parse("  ")).map(token => token.surface_form), [" ", " "]);
        console.log("Packed CommonJS, legacy entry and native ESM checks passed (no MeCab executable required)");
    }
    finally {
        fs.rmSync(temp, { recursive: true, force: true });
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
