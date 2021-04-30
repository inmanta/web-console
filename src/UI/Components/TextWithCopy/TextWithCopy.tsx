import React from "react";
import copy from "copy-to-clipboard";
import { Tooltip } from "@patternfly/react-core";
import { CopyIcon } from "@patternfly/react-icons";

interface Props {
  shortText: string;
  fullText: string;
  tooltipContent: string;
}

export const TextWithCopy: React.FC<Props> = ({
  shortText,
  fullText,
  tooltipContent,
}) => {
  return (
    <span className="only-on-hover-container">
      {shortText}
      <Tooltip content={tooltipContent} entryDelay={200}>
        <CopyIcon
          className="only-on-hover-visible"
          style={{ paddingLeft: 5 }}
          onClick={() => copy(fullText)}
        />
      </Tooltip>
    </span>
  );
};
