import React, { useEffect, useRef, useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  Dropdown,
  DropdownItem,
  Flex,
  FlexItem,
  Icon,
  Label,
  MenuToggle,
  MenuToggleElement,
  Tooltip,
} from "@patternfly/react-core";
import {
  CloseIcon,
  CompressArrowsAltIcon,
  CopyIcon,
  EllipsisVIcon,
  ExpandArrowsAltIcon,
  InfoAltIcon,
  ListOlIcon,
  LongArrowAltDownIcon,
  TextWidthIcon,
} from "@patternfly/react-icons";
import copy from "copy-to-clipboard";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";
import styled from "styled-components";
import { scrollRowIntoView } from "@/UI/Utils";
import { words } from "@/UI/words";

SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("xml", xml);
SyntaxHighlighter.registerLanguage("bash", bash);

interface Props {
  keyId: string;
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
  keyId,
}) => {
  const [copied, setCopied] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [wrapLongLines, setWraplongLines] = useState(true);
  const codeBlockRef = useRef<HTMLDivElement>(null);
  const [allowScrollState, setAllowScrollState] = useState(true);
  const minHeight = "10em";
  const [height, setHeight] = useState(minHeight);

  const onCopy = () => {
    copy(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const dropdownActions = [
    <ToggleTooltip
      enabled={wrapLongLines}
      enabledContent={words("codehighlighter.lineWrapping.off")}
      disabledContent={words("codehighlighter.lineWrapping.on")}
      key={`wraplonglines-${keyId}`}
    >
      <DropdownItem
        onClick={() => setWraplongLines(!wrapLongLines)}
        icon={
          <Icon style={{ opacity: wrapLongLines ? "1" : "0.4" }}>
            <TextWidthIcon />
          </Icon>
        }
      />
    </ToggleTooltip>,
    <ToggleTooltip
      enabled={showLineNumbers}
      enabledContent={words("codehighlighter.lineNumbers.off")}
      disabledContent={words("codehighlighter.lineNumbers.on")}
      key={`showlinenumbers-${keyId}`}
    >
      <DropdownItem
        onClick={() => setShowLineNumbers(!showLineNumbers)}
        icon={
          <Icon style={{ opacity: showLineNumbers ? "1" : "0.4" }}>
            <ListOlIcon />
          </Icon>
        }
      />
    </ToggleTooltip>,
  ];

  const resumeAutoScroll = () => {
    const preBlock = codeBlockRef.current?.querySelector("pre");

    preBlock && preBlock.scrollTo(0, preBlock.scrollHeight);

    setAllowScrollState(true);
  };

  const actions = (
    <>
      <ToggleTooltip
        enabled={copied}
        disabledContent="Copy to clipboard"
        enabledContent="Successfully copied to clipboard!"
      >
        <Icon onClick={onCopy}>
          <CopyIcon />
        </Icon>
      </ToggleTooltip>
      {close && (
        <Icon onClick={close} aria-label="close-icon">
          <CloseIcon />
        </Icon>
      )}
      <ToggleTooltip
        enabled={zoomed}
        enabledContent={words("codehighlighter.zoom.off")}
        disabledContent={words("codehighlighter.zoom.on")}
      >
        {zoomed ? (
          <Icon onClick={() => setZoomed(false)}>
            <CompressArrowsAltIcon />
          </Icon>
        ) : (
          <Icon onClick={() => setZoomed(true)}>
            <ExpandArrowsAltIcon />
          </Icon>
        )}
      </ToggleTooltip>
      {scrollBottom && (
        <Tooltip content={words("codehighlighter.scrollToBottom")}>
          <Icon onClick={resumeAutoScroll}>
            <LongArrowAltDownIcon />
          </Icon>
        </Tooltip>
      )}
      <IconSettings actions={dropdownActions} />
    </>
  );

  const setScrollPositionBottom = (
    element: HTMLPreElement | null | undefined,
  ) => {
    if (scrollBottom && element && allowScrollState && isScrollable(element)) {
      element.scrollTo(0, element.scrollHeight);
    }
  };

  const blockScrollPosition = () => {
    allowScrollState && setAllowScrollState(false);
  };

  useEffect(() => {
    if (zoomed) {
      if (getNumberOfLines(code) < 10) {
        setHeight("fit-content");
      } else {
        setHeight("90vh");
      }
      scrollRowIntoView(codeBlockRef, { block: "start", behavior: "smooth" });
    } else {
      setHeight(minHeight);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomed]);

  // block scroll if the user scrolls.
  useEffect(() => {
    const preBlock = codeBlockRef.current?.querySelector("pre");

    if (scrollBottom && preBlock?.firstChild?.nodeName === "CODE") {
      preBlock?.addEventListener("wheel", blockScrollPosition);
    }

    return () => {
      if (!allowScrollState) {
        preBlock?.removeEventListener("wheel", blockScrollPosition);
      }
    };
  });

  // Scroll to bottom when the code is being updated in the component.
  // The linting escape rule was needed to ignore a false positive in the linting.
  // The method "setScrollPositionBottom" doesn't need to be included in the dependencies.
  useEffect(() => {
    if (!isEmpty(code)) {
      const preBlock = codeBlockRef.current?.querySelector("pre");

      setScrollPositionBottom(preBlock);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <>
      <span ref={codeBlockRef}>
        {isEmpty(code) ? (
          <Label color="blue" variant="outline" icon={<InfoAltIcon />}>
            {words("empty")}
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
                    backgroundColor:
                      "var(--pf-t--global--background--color--secondary--default)",
                    color: "var(--pf-t--global--text--color--regular)",
                    height: height,
                    minHeight,
                    resize: "vertical",
                    scrollbarGutter: "stable",
                    borderRight:
                      "var(--pf-t--global--border--color--brand--default)",
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
              <IconContainer>{actions}</IconContainer>
            </Flex>
          </BorderedArea>
        )}
      </span>
    </>
  );
};

function isScrollable(element) {
  return (
    element.scrollWidth > element.clientWidth ||
    element.scrollHeight > element.clientHeight
  );
}

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

const IconContainer = styled.div`
  width: 4em;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  & div {
    cursor: pointer;
  }
`;

const BorderedArea = styled.div`
  border: 1px solid var(--pf-t--global--border--color--nonstatus--gray--default);
  width: 100%;
  margin-bottom: 1em;
`;

const IconSettings: React.FC<{ actions: JSX.Element[] }> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          aria-label="kebab dropdown toggle"
          variant="plain"
          onClick={() => setIsOpen(!isOpen)}
          isExpanded={isOpen}
        >
          <EllipsisVIcon />
        </MenuToggle>
      )}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      isOpen={isOpen}
      onSelect={() => setIsOpen(false)}
    >
      {actions}
    </Dropdown>
  );
};

const ToggleTooltip: React.FC<{
  enabled: boolean;
  enabledContent: string;
  disabledContent: string;
  children?: React.ReactNode;
}> = ({ enabled, enabledContent, disabledContent, children }) => {
  return (
    <Tooltip
      entryDelay={200}
      animationDuration={0}
      position="left"
      content={<div>{enabled ? enabledContent : disabledContent}</div>}
    >
      <>{children}</>
    </Tooltip>
  );
};
