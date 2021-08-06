import React, { useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";
import {
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
} from "@patternfly/react-core";
import copy from "copy-to-clipboard";

SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("xml", xml);

interface Props {
  code: string;
  language: "json" | "xml";
}

export const CodeHighlighter: React.FC<Props> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    copy(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const actions = (
    <CodeBlockAction>
      <ClipboardCopyButton
        id="copy-button"
        textId="code-content"
        aria-label="Copy to clipboard"
        onClick={onCopy}
        exitDelay={600}
        maxWidth="110px"
        variant="plain"
      >
        {copied ? "Successfully copied to clipboard!" : "Copy to clipboard"}
      </ClipboardCopyButton>
    </CodeBlockAction>
  );

  return (
    <CodeBlock actions={actions}>
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
