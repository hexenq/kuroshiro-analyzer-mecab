import MecabAnalyzer = require("kuroshiro-analyzer-mecab");

const defaults = new MecabAnalyzer({});
const options: MecabAnalyzer.Options = { command: "mecab", dictPath: "/dict/ipadic", execOptions: { timeout: 1000, maxBuffer: 1024, cwd: "/tmp", env: { LANG: "ja_JP.UTF-8" } } };
const custom = new MecabAnalyzer(options);
const legacy: MecabAnalyzer = new MecabAnalyzer.default();

async function check() {
    const initialized: Promise<void> = defaults.init();
    await initialized;
    const tokens: MecabAnalyzer.Token[] = await defaults.parse("  ");
    if (!tokens.length) throw new Error("Expected space tokens");
    const surface: string = tokens[0].surface_form;
    const reading: string | undefined = tokens[0].reading;
    if (surface !== " ") throw new Error("Invalid token");
    const empty: MecabAnalyzer.Token[] = await defaults.parse();
    if (empty.length) throw new Error("Expected empty parse");
}
void check();

function invalid(token: MecabAnalyzer.Token) {
    // @ts-expect-error dictPath belongs in an options object.
    new MecabAnalyzer("dict/");
    // @ts-expect-error Paths must be strings.
    new MecabAnalyzer({ dictPath: 42 });
    // @ts-expect-error parse accepts text, not a number.
    defaults.parse(1);
    // @ts-expect-error Parsing remains asynchronous.
    const tokens: MecabAnalyzer.Token[] = defaults.parse("日本語");
    // @ts-expect-error Unknown tokens may have no reading.
    const reading: string = token.reading;
    // @ts-expect-error Unknown tokens may have no pronunciation.
    const pronunciation: string = token.pronunciation;
    // @ts-expect-error MeCab tokens have no kuromoji metadata.
    token.verbose;
    // @ts-expect-error Execution timeouts must be numeric.
    new MecabAnalyzer({ execOptions: { timeout: "1000" } });
    // @ts-expect-error Commands must be strings.
    new MecabAnalyzer({ command: 42 });
}
