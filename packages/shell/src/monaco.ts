/**
 * Sets up Monaco for the editors of every feature: its workers, the languages they highlight, and
 * the locally-bundled copy for the loader. Every app imports it once at startup
 * (`import "@inmanta/web-console-shell/monaco"`); Vite bundles the workers with the app's build.
 */
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import {
  DARK_MONACO_DIFF_TINTS,
  DIFF_EDITOR_MONACO_THEMES,
  DIFF_TINTS,
} from "@inmanta/web-console-ui/Utils";
import { createMonacoWorker } from "./monaco-workers";

// Monaco worker configuration. Uses getWorker (returns a Worker instance) rather than
// getWorkerUrl so that Vite's worker bundling sets the correct module type automatically.
self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    return createMonacoWorker(label);
  },
};

// Register JSON language
monaco.languages.register({ id: "json" });
monaco.languages.setMonarchTokensProvider("json", {
  tokenizer: {
    root: [
      [/[{}]/, "delimiter.bracket"],
      [/[[\]]/, "delimiter.array"],
      [/:/, "delimiter"],
      [/,/, "delimiter"],
      [/"[^"]*"/, "string"],
      [/true|false|null/, "keyword"],
      [/\d+/, "number"],
    ],
  },
});

// Register XML language
monaco.languages.register({ id: "xml" });
monaco.languages.setMonarchTokensProvider("xml", {
  tokenizer: {
    root: [
      [/</, "delimiter"],
      [/>/, "delimiter"],
      [/[^<>]+/, "string"],
    ],
  },
});

// Register Python language
monaco.languages.register({ id: "python" });
monaco.languages.setMonarchTokensProvider("python", {
  tokenizer: {
    root: [
      [/#.*$/, "comment"],
      [/def|class|if|else|elif|for|while|try|except|finally|with|as|import|from/, "keyword"],
      [/True|False|None/, "keyword"],
      [/"[^"]*"/, "string"],
      [/'[^']*'/, "string"],
      [/\d+/, "number"],
    ],
  },
});

// Register plain text language
monaco.languages.register({ id: "plaintext" });

// Diff editor themes with the diff tints of the attribute table.
monaco.editor.defineTheme(DIFF_EDITOR_MONACO_THEMES.light, {
  base: "vs",
  inherit: true,
  rules: [],
  colors: {
    "diffEditor.removedLineBackground": DIFF_TINTS.removed.background.value,
    "diffEditor.removedTextBackground": DIFF_TINTS.removed.changedPartBackground.value,
    "diffEditor.insertedLineBackground": DIFF_TINTS.added.background.value,
    "diffEditor.insertedTextBackground": DIFF_TINTS.added.changedPartBackground.value,
  },
});
monaco.editor.defineTheme(DIFF_EDITOR_MONACO_THEMES.dark, {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "diffEditor.removedLineBackground": DARK_MONACO_DIFF_TINTS.removed.background.value,
    "diffEditor.removedTextBackground": DARK_MONACO_DIFF_TINTS.removed.changedPartBackground.value,
    "diffEditor.insertedLineBackground": DARK_MONACO_DIFF_TINTS.added.background.value,
    "diffEditor.insertedTextBackground": DARK_MONACO_DIFF_TINTS.added.changedPartBackground.value,
  },
});

// Pass the locally-bundled monaco instance so the loader never fetches from the
// default jsdelivr CDN. Override paths.vs as a belt-and-suspenders guard: if
// state.monaco were somehow unset, the fallback script URL would be relative
// (/loader.js) instead of the CDN URL.
loader.config({ monaco, paths: { vs: "" } });
loader.init();
