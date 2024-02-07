import React from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import { Diff } from "@/Core";

export const DiffView: React.FC<Diff.Values> = ({ from, to }) => (
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
    compareMethod={
      isMultiLine(from) || isMultiLine(to) ? DiffMethod.WORDS : DiffMethod.CHARS
    }
    oldValue={from}
    newValue={to}
    hideLineNumbers={true}
  />
);

const isMultiLine = (value: string): boolean => value.indexOf("\n") >= 0;
