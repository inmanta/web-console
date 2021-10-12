import React, { useState } from "react";
import styled from "styled-components";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";
import {
  Button,
  ClipboardCopyButton,
  Flex,
  FlexItem,
  Label,
} from "@patternfly/react-core";
import copy from "copy-to-clipboard";
import { CloseIcon, InfoCircleIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";

SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("xml", xml);

interface Props {
  code: string;
  language: "json" | "xml" | "text" | "python";
  close?: () => void;
}

export const CodeHighlighter: React.FC<Props> = ({ code, language, close }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    copy(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const actions = (
    <>
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
      {close && (
        <Button variant="plain" aria-label="Close icon" onClick={close}>
          <CloseIcon />
        </Button>
      )}
    </>
  );

  return (
    <>
      {isEmpty(code) ? (
        <Label variant="outline" icon={<InfoCircleIcon />}>
          <pre>{words("empty")}</pre>
        </Label>
      ) : isShortSingleLine(code) ? (
        <pre>{code}</pre>
      ) : (
        <BorderedArea>
          <Flex flexWrap={{ default: "nowrap" }}>
            <FlexItemWithOverflow grow={{ default: "grow" }}>
              <SyntaxHighlighter
                language={language}
                style={docco}
                customStyle={{
                  backgroundColor: "initial",
                  maxWidth: "50em",
                  height: "6em",
                  minHeight: "4.5em",
                  overflow: "auto",
                  resize: "vertical",
                  borderRight: "1px solid var(--pf-global--BorderColor--100)",
                }}
              >
                {code}
              </SyntaxHighlighter>
            </FlexItemWithOverflow>
            <SmallFlexItem>{actions}</SmallFlexItem>
          </Flex>
        </BorderedArea>
      )}
    </>
  );
};

function isEmpty(code: string) {
  return !(code && code.length > 0);
}

function isShortSingleLine(code: string) {
  return !code.includes("\n") && code.length < 60;
}

const FlexItemWithOverflow = styled(FlexItem)`
  margin-right: 0;
  overflow: auto;
`;

const SmallFlexItem = styled(FlexItem)`
  width: 3em;
`;

const BorderedArea = styled.div`
  border: 1px solid var(--pf-global--BorderColor--100);
`;
