import React from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer";

const customStyles = {
  marker: {
    display: "none",
  },
};

interface Props {
  oldText: string;
  newText: string;
}

export const ReactDiffViewerExample: React.FC<Props> = ({
  oldText,
  newText,
}) => {
  return (
    <div className="App">
      <h1>ReactDiffViewer Demo CodeSandbox</h1>
      <h2>Line view (without markers)</h2>
      <ReactDiffViewer
        styles={customStyles}
        compareMethod={DiffMethod.WORDS}
        oldValue={oldText}
        newValue={newText}
        splitView={false}
        hideLineNumbers={true}
      />

      <h2>Line view (with markers)</h2>
      <ReactDiffViewer
        compareMethod={DiffMethod.WORDS}
        oldValue={oldText}
        newValue={newText}
        splitView={false}
        hideLineNumbers={true}
      />

      <h2>Split view (without markers)</h2>
      <ReactDiffViewer
        styles={{ marker: { display: "none" } }}
        compareMethod={DiffMethod.WORDS}
        oldValue={oldText}
        newValue={newText}
        hideLineNumbers={true}
      />

      <h2>Split view (with markers)</h2>
      <ReactDiffViewer
        compareMethod={DiffMethod.WORDS}
        oldValue={oldText}
        newValue={newText}
        hideLineNumbers={true}
      />
    </div>
  );
};
