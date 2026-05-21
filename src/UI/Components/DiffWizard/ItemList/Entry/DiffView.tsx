import React from "react";
import _ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import { Diff } from "@/Core";

// react-diff-viewer-continued is a CJS-only package (no ESM entry). Vite 8 /
// rolldown pre-bundles it as `export default require_src()`, where require_src()
// returns the raw CJS exports object: { __esModule: true, default: DiffViewer, … }.
// Vite marks the package needsInterop: true and is supposed to rewrite the
// default import to extract .default, but that rewrite is not applied when
// CDN-intercept plugins alter the module processing pipeline. The result is that
// _ReactDiffViewer receives the exports namespace instead of the class, and React
// throws "Element type is invalid" when it tries to render it.
// Named imports (DiffMethod) are resolved separately and are unaffected.
/* eslint-disable @typescript-eslint/no-explicit-any */
const ReactDiffViewer = (
  typeof _ReactDiffViewer === "function" ? _ReactDiffViewer : (_ReactDiffViewer as any).default
) as typeof _ReactDiffViewer;
/* eslint-enable @typescript-eslint/no-explicit-any */

export const DiffView: React.FC<Diff.Values> = ({ from, to }) => {
  return (
    <ReactDiffViewer
      showDiffOnly={false}
      styles={{
        marker: { display: "none" },
        wordDiff: { padding: 0 },
        contentText: { lineHeight: "29px !important" },
        line: { display: "flex" },
        content: {
          overflowWrap: "anywhere",
          padding: "0 4px",
        },
      }}
      compareMethod={isMultiLine(from) || isMultiLine(to) ? DiffMethod.WORDS : DiffMethod.CHARS}
      oldValue={from}
      newValue={to}
      hideLineNumbers={true}
    />
  );
};

const isMultiLine = (value: string): boolean => value.indexOf("\n") >= 0;
