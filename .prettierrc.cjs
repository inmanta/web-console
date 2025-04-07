/**
 * Prettier configuration that matches our ESLint rules
 */
module.exports = {
    // Basic formatting
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    semi: true,

    // Quotes
    singleQuote: false,
    jsxSingleQuote: false,
    quoteProps: "as-needed",

    // Spacing
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: "always",

    // Line endings and wrapping
    endOfLine: "auto",
    proseWrap: "preserve",
    embeddedLanguageFormatting: "auto",

    singleAttributePerLine: false,
    htmlWhitespaceSensitivity: "css",
    vueIndentScriptAndStyle: false,

    // Trailing commas
    trailingComma: "es5",
};
