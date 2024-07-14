import babelParser from "@babel/eslint-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("google"), {
    languageOptions: {
        parser: babelParser,
        ecmaVersion: 6,
        sourceType: "module",
        parserOptions: {
            requireConfigFile: false,
            sourceType: "module",
        },
    },

    rules: {
        "no-invalid-this": "off",
        indent: ["error", 4],
        "space-before-function-paren": "off",
        "operator-linebreak": ["error", "before"],
        "require-jsdoc": "off",
        "valid-jsdoc": "off",

        "max-len": ["error", {
            code: 100,
        }],
    },
}];
