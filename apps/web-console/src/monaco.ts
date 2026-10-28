/**
 * Sets up Monaco for the editors of every feature: its workers, the languages they highlight, and
 * the locally-bundled copy for the loader. It lives in the app because Vite bundles the workers
 * with the app's build.
 */
import "monaco-editor/min/vs/editor/editor.main.css";
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
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

// Pass the locally-bundled monaco instance so the loader never fetches from the
// default jsdelivr CDN. Override paths.vs as a belt-and-suspenders guard: if
// state.monaco were somehow unset, the fallback script URL would be relative
// (/loader.js) instead of the CDN URL.
loader.config({ monaco, paths: { vs: "" } });
loader.init();
