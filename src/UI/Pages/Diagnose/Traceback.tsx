import React from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { ExpandableSection } from "@patternfly/react-core";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";
import { words } from "@/UI/words";

SyntaxHighlighter.registerLanguage("python", python);

export const Traceback: React.FC<{ trace: string }> = ({ trace }) => {
  return (
    <ExpandableSection toggleText={words("diagnose.rejection.traceback")}>
      <SyntaxHighlighter language="python" style={docco}>
        {trace}
      </SyntaxHighlighter>
    </ExpandableSection>
  );
};
