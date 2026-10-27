import React from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import { Diff } from "@inmanta/web-console-core";

export const DiffView: React.FC<Diff.Values> = ({ from, to }) => {
  return (
    <ReactDiffViewer
      hideSummary={true}
      showDiffOnly={false}
      styles={{
        // The library sizes columns with a <colgroup>; hide the 28px marker columns along with the marker cells.
        diffContainer: { 'col[width="28px"]': { display: "none" } },
        marker: { display: "none" },
        wordDiff: { padding: 0 },
        contentText: { lineHeight: "29px !important" },
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
