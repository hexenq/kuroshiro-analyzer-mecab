import MecabAnalyzer from "kuroshiro-analyzer-mecab";

const analyzer: MecabAnalyzer = new MecabAnalyzer();
if (typeof analyzer.parse !== "function") throw new Error("Invalid CommonJS default import");
