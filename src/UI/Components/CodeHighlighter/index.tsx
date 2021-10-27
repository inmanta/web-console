import React, { useRef, useState } from "react";
import styled from "styled-components";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";
import {
  Button,
  ClipboardCopyButton,
  Dropdown,
  DropdownItem,
  Flex,
  FlexItem,
  KebabToggle,
  Label,
  Tooltip,
} from "@patternfly/react-core";
import copy from "copy-to-clipboard";
import {
  CloseIcon,
  InfoCircleIcon,
  ListOlIcon,
  SearchMinusIcon,
  SearchPlusIcon,
  TextWidthIcon,
} from "@patternfly/react-icons";
import { words } from "@/UI/words";
import { scrollRowIntoView } from "@/UI/Utils";

SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("xml", xml);

interface Props {
  code: string;
  language: "json" | "xml" | "text" | "python";
  close?: () => void;
}

export const CodeHighlighter: React.FC<Props> = ({ code, language, close }) => {
  const [copied, setCopied] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [wrapLongLines, setWraplongLines] = useState(true);
  const codeBlockRef = useRef<HTMLDivElement>(null);
  const minHeight = "8em";

  const onCopy = () => {
    copy(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };
  const [height, setHeight] = useState(minHeight);
  const onZoomIn = () => {
    if (getNumberOfLines(code) < 10) {
      setHeight("fit-content");
    } else {
      setHeight("90vh");
    }
    setZoomed(true);
    scrollRowIntoView(codeBlockRef, { block: "start", behavior: "smooth" });
  };
  const onZoomOut = () => {
    setHeight(minHeight);
    setZoomed(false);
  };

  const dropdownActions = [
    <ToggleTooltip
      enabled={wrapLongLines}
      enabledContent={words("codehighlighter.lineWrapping.off")}
      disabledContent={words("codehighlighter.lineWrapping.on")}
      key="wraplonglines"
    >
      <StyledDropdownItem
        $isEnabled={wrapLongLines}
        onClick={() => setWraplongLines(!wrapLongLines)}
      >
        <TextWidthIcon />
      </StyledDropdownItem>
    </ToggleTooltip>,
    <ToggleTooltip
      enabled={showLineNumbers}
      enabledContent={words("codehighlighter.lineNumbers.off")}
      disabledContent={words("codehighlighter.lineNumbers.on")}
      key="showlinenumbers"
    >
      <StyledDropdownItem
        $isEnabled={showLineNumbers}
        onClick={() => {
          setShowLineNumbers(!showLineNumbers);
        }}
      >
        <ListOlIcon />
      </StyledDropdownItem>
    </ToggleTooltip>,
  ];

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
      <ToggleTooltip
        enabled={zoomed}
        enabledContent={words("codehighlighter.zoom.off")}
        disabledContent={words("codehighlighter.zoom.on")}
      >
        {zoomed ? (
          <Button variant="plain" onClick={onZoomOut}>
            <SearchMinusIcon />
          </Button>
        ) : (
          <Button variant="plain" onClick={onZoomIn}>
            <SearchPlusIcon />
          </Button>
        )}
      </ToggleTooltip>
      <IconSettings actions={dropdownActions} />
    </>
  );

  return (
    <>
      <span ref={codeBlockRef} />
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
                  height: height,
                  minHeight,
                  resize: "vertical",
                  scrollbarGutter: "stable",
                  borderRight: "1px solid var(--pf-global--BorderColor--100)",
                }}
                showLineNumbers={showLineNumbers}
                showInlineLineNumbers
                lineNumberStyle={{
                  whiteSpace: "nowrap",
                  marginRight: "1em",
                  paddingRight: 0,
                  minWidth: "1.25em",
                }}
                wrapLongLines={wrapLongLines}
                wrapLines
                lineProps={{ style: { wordBreak: "break-word" } }}
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

function getNumberOfLines(code: string) {
  return (code.match(/\n/g) || []).length;
}

const FlexItemWithOverflow = styled(FlexItem)`
  margin-right: 0;
  overflow: auto;
  width: 100vw;
`;

const SmallFlexItem = styled(FlexItem)`
  width: 3em;
`;

const BorderedArea = styled.div`
  border: 1px solid var(--pf-global--BorderColor--100);
  width: 100%;
  margin-bottom: 1em;
`;

const IconSettings: React.FC<{ actions: JSX.Element[] }> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dropdown
      toggle={<KebabToggle onToggle={() => setIsOpen(!isOpen)} />}
      isOpen={isOpen}
      isPlain
      dropdownItems={actions}
    />
  );
};

const StyledDropdownItem = styled(DropdownItem)<{ $isEnabled: boolean }>`
  ${({ $isEnabled }) => ($isEnabled ? "opacity :1" : "opacity: 0.4")}
`;

const ToggleTooltip: React.FC<{
  enabled: boolean;
  enabledContent: string;
  disabledContent: string;
}> = ({ enabled, enabledContent, disabledContent, children }) => {
  return (
    <Tooltip
      entryDelay={200}
      content={enabled ? enabledContent : disabledContent}
      style={{ width: "150px" }}
    >
      <span>{children}</span>
    </Tooltip>
  );
};
