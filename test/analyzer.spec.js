import Mecab from "mecab-async";
import Analyzer from "../src/index.js";

jest.mock("mecab-async", () => jest.fn());

describe("MeCab adapter", () => {
    let backend;
    beforeEach(() => {
        backend = { parseFormat: jest.fn() };
        Mecab.mockReset().mockImplementation(() => backend);
    });

    it("initializes the default command without invoking the executable", async () => {
        const analyzer = new Analyzer();
        await expect(analyzer.init()).resolves.toBeUndefined();
        expect(backend.command).toBe("mecab");
        expect(backend.options).toEqual({});
        expect(backend.parseFormat).not.toHaveBeenCalled();
    });

    it("passes explicit command and execution options through", async () => {
        const execOptions = { timeout: 1000, maxBuffer: 1024 };
        await new Analyzer({ command: "custom-mecab -d /dict/ipadic", dictPath: "/ignored", execOptions }).init();
        expect(backend.command).toBe("custom-mecab -d /dict/ipadic");
        expect(backend.options).toBe(execOptions);
    });

    it("uses the supplied dictionary path when command is absent", async () => {
        await new Analyzer({ dictPath: "/dict/ipadic" }).init();
        expect(backend.command).toBe("mecab -d /dict/ipadic");
    });

    it("rejects repeated initialization", async () => {
        const analyzer = new Analyzer();
        await analyzer.init();
        await expect(analyzer.init()).rejects.toThrow("already been initialized");
        expect(Mecab).toHaveBeenCalledTimes(1);
    });

    it("maps IPADIC columns to the public token fields", async () => {
        await new Analyzer().init();
        expect(backend.parser(["日本語", "名詞", "一般", "*", "*", "*", "*", "日本語", "ニホンゴ", "ニホンゴ"])).toEqual({
            surface_form: "日本語", pos: "名詞", pos_detail_1: "一般", pos_detail_2: "*", pos_detail_3: "*",
            conjugated_type: "*", conjugated_form: "*", basic_form: "日本語", reading: "ニホンゴ", pronunciation: "ニホンゴ"
        });
    });

    it("leaves missing readings undefined for unknown words", async () => {
        await new Analyzer().init();
        const token = backend.parser(["OpenAI", "名詞", "一般", "*", "*", "*", "*", "*"]);
        expect(token.surface_form).toBe("OpenAI");
        expect(token.reading).toBeUndefined();
        expect(token.pronunciation).toBeUndefined();
    });

    it("preserves leading, repeated and trailing ASCII spaces and token order", async () => {
        const analyzer = new Analyzer();
        await analyzer.init();
        const callbacks = new Map();
        backend.parseFormat.mockImplementation((text, callback) => callbacks.set(text, callback));
        const pending = analyzer.parse(" 日本語  学ぶ ");
        // Complete in reverse order to exercise Promise.all ordering.
        callbacks.get("学ぶ")(null, [{ surface_form: "学ぶ", reading: "マナブ" }]);
        callbacks.get("日本語")(null, [{ surface_form: "日本語", reading: "ニホンゴ" }]);
        const tokens = await pending;
        expect(tokens.map(token => token.surface_form)).toEqual([" ", "日本語", " ", " ", "学ぶ", " "]);
        expect(tokens[0]).toMatchObject({ pos: "記号", pos_detail_1: "空白", basic_form: "*" });
        expect(backend.parseFormat).toHaveBeenCalledTimes(2);
    });

    it.each([undefined, ""])("returns an empty array for %p", async (text) => {
        const analyzer = new Analyzer();
        await analyzer.init();
        await expect(analyzer.parse(text)).resolves.toEqual([]);
        expect(backend.parseFormat).not.toHaveBeenCalled();
    });

    it("preserves a space-only input without invoking MeCab", async () => {
        const analyzer = new Analyzer();
        await analyzer.init();
        expect((await analyzer.parse("  ")).map(token => token.surface_form)).toEqual([" ", " "]);
        expect(backend.parseFormat).not.toHaveBeenCalled();
    });

    it("propagates command execution errors", async () => {
        const analyzer = new Analyzer();
        await analyzer.init();
        const error = new Error("MeCab failed");
        backend.parseFormat.mockImplementation((_text, callback) => callback(error));
        await expect(analyzer.parse("日本語")).rejects.toBe(error);
    });

    it("rejects non-empty parsing before initialization asynchronously", async () => {
        await expect(new Analyzer().parse("日本語")).rejects.toBeInstanceOf(Error);
    });

    it("rejects invalid input asynchronously", async () => {
        await expect(new Analyzer().parse(null)).rejects.toBeInstanceOf(TypeError);
    });
});
