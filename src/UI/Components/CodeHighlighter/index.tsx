import React from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";
import { CodeBlock, CodeBlockCode } from "@patternfly/react-core";

SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("xml", xml);

interface Props {
  code: string;
  language: "json" | "xml";
}

export const CodeHighlighter: React.FC<Props> = ({ code, language }) => {
  return (
    <CodeBlock>
      <CodeBlockCode>
        <SyntaxHighlighter
          language={language}
          style={docco}
          customStyle={{ padding: 0, backgroundColor: "initial" }}
        >
          {code}
        </SyntaxHighlighter>
      </CodeBlockCode>
    </CodeBlock>
  );
};
