"use strict";

const assert = require("node:assert/strict");
const Analyzer = require("..");

async function main() {
    const analyzer = new Analyzer({
        command: process.env.MECAB_COMMAND,
        dictPath: process.env.MECAB_DICT_PATH,
        execOptions: { timeout: 10000, maxBuffer: 1024 * 1024 }
    });
    await analyzer.init();
    const tokens = await analyzer.parse("日本語");
    assert.equal(tokens.map(token => token.surface_form).join(""), "日本語");
    assert.equal(tokens.map(token => token.reading || "").join(""), "ニホンゴ");
    assert.ok(tokens.every(token => typeof token.pos === "string"));
    const sentence = " 日本語  を学ぶ ";
    assert.equal((await analyzer.parse(sentence)).map(token => token.surface_form).join(""), sentence);
    await assert.rejects(analyzer.init(), /already been initialized/);
    const missing = new Analyzer({ command: "kuroshiro-nonexistent-mecab-command", execOptions: { timeout: 10000 } });
    await missing.init();
    await assert.rejects(missing.parse("日本語"));
    console.log("Real MeCab integration passed: UTF-8 readings, space preservation and command error propagation");
}

main().catch(error => {
    console.error("Real MeCab integration requires MeCab and a UTF-8 IPADIC-compatible dictionary.");
    console.error(error);
    process.exitCode = 1;
});
