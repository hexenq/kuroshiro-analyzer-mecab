"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { createRequire } = require("node:module");
const { pathToFileURL } = require("node:url");

async function main() {
    assert.ok(process.env.MECAB_CONSUMER_DIR, "Set MECAB_CONSUMER_DIR to the isolated package consumer");
    const directory = path.resolve(process.env.MECAB_CONSUMER_DIR);
    const consumer = createRequire(path.join(directory, "package.json"));
    const names = ["kuroshiro", "kuroshiro-analyzer-mecab", "mecab-published"];
    for (const name of names) {
        assert.ok(consumer.resolve(name).startsWith(directory + path.sep), `Non-isolated dependency: ${name}`);
    }
    const Kuroshiro = consumer("kuroshiro");
    const Current = consumer("kuroshiro-analyzer-mecab");
    const Published = consumer("mecab-published");
    const options = {
        command: process.env.MECAB_COMMAND,
        dictPath: process.env.MECAB_DICT_PATH,
        execOptions: { timeout: 10000, maxBuffer: 1024 * 1024 }
    };
    const current = new Current(options);
    const published = new Published(options);
    await current.init();
    await published.init();
    const samples = ["日本語", "日本語を学ぶ。", "すもももももも", " 日本語  を学ぶ "];
    for (const sentence of samples) {
        assert.deepEqual(await current.parse(sentence), await published.parse(sentence), sentence);
    }
    const baseline = new Kuroshiro();
    await baseline.init(new Published(options));
    const cases = [];
    for (const text of samples) {
        for (const to of ["hiragana", "katakana", "romaji"]) {
            for (const mode of ["normal", "spaced", "okurigana", "furigana"]) {
                for (const romajiSystem of to === "romaji" ? ["hepburn", "nippon", "passport"] : ["hepburn"]) {
                    const settings = { to, mode, romajiSystem };
                    cases.push({ text, settings, expected: await baseline.convert(text, settings) });
                }
            }
        }
    }
    assert.equal(await baseline.convert("日本語", { to: "hiragana" }), "にほんご");
    const ESMCore = (await import(pathToFileURL(consumer.resolve("kuroshiro")))).default;
    let checks = 0;
    for (const [Core, Analyzer, label] of [
        [Kuroshiro, Current, "current CJS"],
        [ESMCore, (await import(pathToFileURL(consumer.resolve("kuroshiro-analyzer-mecab")))).default, "current ESM"],
        [ESMCore, (await import(pathToFileURL(consumer.resolve("mecab-published")))).default, "published ESM"]
    ]) {
        const core = new Core();
        await core.init(new Analyzer(options));
        for (const { text, settings, expected } of cases) {
            assert.equal(await core.convert(text, settings), expected, `${label}: ${text} ${JSON.stringify(settings)}`);
            checks++;
        }
        assert.equal(await core.convert(""), "");
    }
    console.log(`Real MeCab joint tests passed: ${checks} comparisons against published 1.0.1, plus token and known-reading checks`);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
