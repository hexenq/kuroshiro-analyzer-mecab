import MecabAnalyzer from "kuroshiro-analyzer-mecab";

const options: MecabAnalyzer.Options = {};
const analyzer = new MecabAnalyzer(options);
async function check() {
    await analyzer.init();
    const tokens: MecabAnalyzer.Token[] = await analyzer.parse(" ");
    if (tokens.map(token => token.surface_form).join("") !== " ") {
        throw new Error("Invalid native ESM analyzer");
    }
}
void check();
