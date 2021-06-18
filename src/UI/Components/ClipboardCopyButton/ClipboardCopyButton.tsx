import { words } from "@/UI/words";
import { Button, Tooltip } from "@patternfly/react-core";
import { CopyIcon } from "@patternfly/react-icons";
import copy from "copy-to-clipboard";
import React from "react";
import { useState } from "react";
import styled from "styled-components";

interface Props {
  className?: string;
  fullText: string;
  tooltipContent: string;
}

export const ClipboardCopyButton: React.FC<Props> = ({
  className,
  fullText,
  tooltipContent,
}) => {
  const [copied, setCopied] = useState(false);
  return (
    <WidthLimitedTooltip
      content={<div>{!copied ? tooltipContent : words("copy.feedback")}</div>}
      entryDelay={200}
    >
      <Button
        variant="plain"
        aria-label="Copy to clipboard"
        className={className}
        onClick={() => {
          copy(fullText);
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        }}
      >
        <CopyIcon />
      </Button>
    </WidthLimitedTooltip>
  );
};

const WidthLimitedTooltip = styled(Tooltip)`
  width: 150px;
`;
