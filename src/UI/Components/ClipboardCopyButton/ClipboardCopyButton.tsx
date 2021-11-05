import React, { useState } from "react";
import { Button, Tooltip, ButtonProps } from "@patternfly/react-core";
import { CopyIcon } from "@patternfly/react-icons";
import copy from "copy-to-clipboard";
import styled from "styled-components";
import { words } from "@/UI/words";

interface Props {
  value: string;
  tooltipContent?: string;
  isDisabled?: boolean;
  className?: string;
  variant?: ButtonProps["variant"];
}

export const ClipboardCopyButton: React.FC<Props> = ({
  className,
  value,
  tooltipContent,
  isDisabled,
  variant,
  ...props
}) => {
  const [copied, setCopied] = useState(false);
  const onClick = () => {
    copy(value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const tooltipText = copied
    ? words("copy.feedback")
    : tooltipContent || words("copy");

  return (
    <WidthLimitedTooltip content={<div>{tooltipText}</div>} entryDelay={200}>
      <Button
        {...props}
        variant={variant || "plain"}
        aria-label="Copy to clipboard"
        className={className}
        onClick={onClick}
        isDisabled={isDisabled}
      >
        <CopyIcon />
      </Button>
    </WidthLimitedTooltip>
  );
};

const WidthLimitedTooltip = styled(Tooltip)`
  width: 150px;
`;
