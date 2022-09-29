import React, { useEffect, useRef, useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
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
import {
  CloseIcon,
  CompressArrowsAltIcon,
  ExpandArrowsAltIcon,
  InfoCircleIcon,
  ListOlIcon,
  TextWidthIcon,
} from "@patternfly/react-icons";
import copy from "copy-to-clipboard";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";
import styled, { css } from "styled-components";
import { scrollRowIntoView } from "@/UI/Utils";
import { words } from "@/UI/words";

SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("xml", xml);
SyntaxHighlighter.registerLanguage("bash", bash);

interface Props {
  code: string;
  language: "json" | "xml" | "text" | "python" | "bash";
  scrollBottom?: boolean;
  close?: () => void;
}

export const CodeHighlighter: React.FC<Props> = ({
  code,
  language,
  scrollBottom = false,
  close,
}) => {
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
      <CenteredCopyButton
        id="copy-button"
        textId="code-content"
        aria-label="Copy to clipboard"
        onClick={onCopy}
        exitDelay={600}
        maxWidth="110px"
        variant="plain"
      >
        {copied ? "Successfully copied to clipboard!" : "Copy to clipboard"}
      </CenteredCopyButton>
      {close && (
        <SidebarButton variant="plain" aria-label="Close icon" onClick={close}>
          <CloseIcon />
        </SidebarButton>
      )}
      <ToggleTooltip
        enabled={zoomed}
        enabledContent={words("codehighlighter.zoom.off")}
        disabledContent={words("codehighlighter.zoom.on")}
      >
        {zoomed ? (
          <SidebarButton variant="plain" onClick={onZoomOut}>
            <CompressArrowsAltIcon />
          </SidebarButton>
        ) : (
          <SidebarButton variant="plain" onClick={onZoomIn}>
            <ExpandArrowsAltIcon />
          </SidebarButton>
        )}
      </ToggleTooltip>
      <IconSettings actions={dropdownActions} />
    </>
  );

  const setScrollPosition = () => {
    if (!scrollBottom) {
      return;
    }

    const preBlock = codeBlockRef.current?.querySelector("pre");

    if (preBlock && preBlock.firstChild?.nodeName === "CODE") {
      preBlock.scrollTo(0, preBlock.scrollHeight);
    }
  };

  useEffect(() => {
    setScrollPosition();
  });

  return (
    <>
      <span ref={codeBlockRef}>
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
                  lineProps={{
                    style: { wordBreak: "break-word", flexWrap: "wrap" },
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </FlexItemWithOverflow>
              <SmallFlexItem>{actions}</SmallFlexItem>
            </Flex>
          </BorderedArea>
        )}
      </span>
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
  width: 4em;
`;

const BorderedArea = styled.div`
  border: 1px solid var(--pf-global--BorderColor--100);
  width: 100%;
  margin-bottom: 1em;
`;

const IconSettings: React.FC<{ actions: JSX.Element[] }> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <CenteredDropdown
      toggle={<CenteredToggle onToggle={() => setIsOpen(!isOpen)} />}
      isOpen={isOpen}
      isPlain
      dropdownItems={actions}
    />
  );
};

const StyledDropdownItem = styled(DropdownItem)<{ $isEnabled: boolean }>`
  ${({ $isEnabled }) => ($isEnabled ? "opacity: 1;" : "opacity: 0.4;")}
`;

const centeredSidebarStyles = css`
  padding-left: 0;
  padding-right: 0;
  margin: auto;
  width: 100%;
`;

const SidebarButton = styled(Button)`
  ${centeredSidebarStyles}
`;

const CenteredDropdown = styled(Dropdown)`
  ${centeredSidebarStyles}
`;
const CenteredToggle = styled(KebabToggle)`
  ${centeredSidebarStyles}
`;

const CenteredCopyButton = styled(ClipboardCopyButton)`
  ${centeredSidebarStyles}
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
