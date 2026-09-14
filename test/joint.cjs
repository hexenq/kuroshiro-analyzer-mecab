"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { createRequire } = require("node:module");
const { pathToFileURL } = require("node:url");

async function main() {
    assert.ok(process.env.MECAB_CONSUMER_DIR, "Set MECAB_CONSUMER_DIR to the isolated package consumer");
    const directory = path.resolve(process.env.MECAB_CONSUMER_DIR);
    const consumer = createRequire(path.join(directory, "package.json"));
    const baselinePackage = process.env.MECAB_BASELINE_PACKAGE;
    const names = ["kuroshiro", "kuroshiro-analyzer-mecab"];
    if (baselinePackage) names.push(baselinePackage);
    for (const name of names) {
        assert.ok(consumer.resolve(name).startsWith(directory + path.sep), `Non-isolated dependency: ${name}`);
    }
    const Kuroshiro = consumer("kuroshiro");
    const Current = consumer("kuroshiro-analyzer-mecab");
    const options = {
        command: process.env.MECAB_COMMAND,
        dictPath: process.env.MECAB_DICT_PATH,
        execOptions: { timeout: 10000, maxBuffer: 1024 * 1024 }
    };
    const cases = [
        ["日本語", { to: "hiragana" }, "にほんご"],
        ["日本語", { to: "katakana" }, "ニホンゴ"],
        ["日本語", { to: "romaji" }, "nihongo"],
        ["日本語を学ぶ。", { to: "hiragana" }, "にほんごをまなぶ。"],
        ["日本語", { to: "hiragana", mode: "spaced" }, "にほんご"],
        ["日本語", { to: "hiragana", mode: "okurigana" }, "日本語(にほんご)"],
        ["日本語", { to: "hiragana", mode: "furigana" }, "<ruby>日本語<rp>(</rp><rt>にほんご</rt><rp>)</rp></ruby>"],
        ["し", { to: "romaji", romajiSystem: "hepburn" }, "shi"],
        ["し", { to: "romaji", romajiSystem: "nippon" }, "si"],
        ["し", { to: "romaji", romajiSystem: "passport" }, "shi"]
    ];
    const current = new Current(options);
    await current.init();
    const spaced = " 日本語  を学ぶ ";
    assert.equal((await current.parse(spaced)).map(token => token.surface_form).join(""), spaced);
    const ESMCore = (await import(pathToFileURL(consumer.resolve("kuroshiro")))).default;
    for (const [Core, Analyzer, label] of [
        [Kuroshiro, Current, "CJS"],
        [ESMCore, (await import(pathToFileURL(consumer.resolve("kuroshiro-analyzer-mecab")))).default, "ESM"]
    ]) {
        const core = new Core();
        await core.init(new Analyzer(options));
        for (const [text, settings, expected] of cases) {
            assert.equal(await core.convert(text, settings), expected, `${label}: ${text} ${JSON.stringify(settings)}`);
        }
        assert.equal(await core.convert(""), "");
        await assert.rejects(core.convert("日本語", { to: "invalid" }), /Invalid Target Syllabary/);
    }
    console.log("Real MeCab joint tests passed: explicit conversion expectations with CJS and native ESM");

    // Optional release evaluation: install a chosen version under an npm alias.
    if (baselinePackage) {
        const Baseline = consumer(baselinePackage);
        const baseline = new Kuroshiro();
        await baseline.init(new Baseline(options));
        for (const [text, settings, expected] of cases) {
            assert.equal(await baseline.convert(text, settings), expected, `Baseline ${baselinePackage}: ${text}`);
        }
        console.log(`Optional compatibility check passed: ${baselinePackage}`);
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
