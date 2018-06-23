/**
 * @jest-environment jsdom
 */

import Analyzer from "../src";

describe("kuroshiro-analyzer-mecab Browser Test", () => {
    const EXAMPLE_TEXT = "すもももももも";

    let analyzer;

    beforeAll(async () => {
        analyzer = new Analyzer();
        await analyzer.init();
    });
    it("Parse Sentence", (done) => {
        const ori = EXAMPLE_TEXT;
        analyzer.parse(ori)
            .then((result) => {
                // console.debug(result);
                expect(result).toBeInstanceOf(Array);
                expect(result).toHaveLength(1);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});
