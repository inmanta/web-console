import { words } from "@/UI";
import { ExpandableSection } from "@patternfly/react-core";
import React from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";

SyntaxHighlighter.registerLanguage("python", python);

export const Traceback: React.FC<{ trace?: string }> = ({ trace }) => {
  return (
    <>
      {trace && (
        <ExpandableSection toggleText={words("diagnose.rejection.traceback")}>
          <SyntaxHighlighter language="python" style={docco}>
            {trace}
          </SyntaxHighlighter>
        </ExpandableSection>
      )}
    </>
  );
};
