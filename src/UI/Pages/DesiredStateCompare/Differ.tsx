import React from "react";
import { parseDiff, Diff, Hunk } from "react-diff-view";
import "react-diff-view/style/index.css";

interface Props {
  diffText: string;
}

export const Differ: React.FC<Props> = ({ diffText }) => {
  const files = parseDiff(diffText);

  console.log({ files });

  const renderFile = ({ oldRevision, newRevision, type, hunks }) => (
    <Diff
      key={oldRevision + "-" + newRevision}
      viewType="split"
      diffType={type}
      hunks={hunks}
    >
      {(hunks) => hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)}
    </Diff>
  );

  return <div>{files.map(renderFile)}</div>;
};
