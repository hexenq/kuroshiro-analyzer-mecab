import js from "@eslint/js";
import globals from "globals";

export default [
    { ignores: ["coverage/**", "lib/**", "node_modules/**"] },
    js.configs.recommended,
    {
        files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
        languageOptions: { globals: { ...globals.node, ...globals.jest } },
        rules: { "no-unused-vars": ["error", { argsIgnorePattern: "^_" }] }
    }
];
