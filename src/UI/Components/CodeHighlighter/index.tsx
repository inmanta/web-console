import React, { useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";
import {
  Button,
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
} from "@patternfly/react-core";
import copy from "copy-to-clipboard";
import {
  ResourcesAlmostEmptyIcon,
  ResourcesFullIcon,
} from "@patternfly/react-icons";

SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("xml", xml);

interface Props {
  code: string;
  language: "json" | "xml";
}

export const CodeHighlighter: React.FC<Props> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const onCopy = () => {
    copy(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const styles = needsExpansion(code) && !expanded ? { height: "60px" } : {};

  const actions = (
    <>
      {needsExpansion(code) && (
        <CodeBlockAction>
          <Button
            aria-label="Copy to clipboard"
            onClick={() => setExpanded(!expanded)}
            variant="plain"
          >
            {expanded ? <ResourcesFullIcon /> : <ResourcesAlmostEmptyIcon />}
          </Button>
        </CodeBlockAction>
      )}
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
    </>
  );

  return (
    <CodeBlock actions={actions}>
      <CodeBlockCode>
        <SyntaxHighlighter
          language={language}
          style={docco}
          customStyle={{ padding: 0, backgroundColor: "initial", ...styles }}
        >
          {code}
        </SyntaxHighlighter>
      </CodeBlockCode>
    </CodeBlock>
  );
};

function needsExpansion(value: string): boolean {
  return value.split("\n").length > 4;
}
