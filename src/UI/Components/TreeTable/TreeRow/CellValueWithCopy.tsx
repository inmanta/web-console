import { CopyIcon } from "@patternfly/react-icons";
import { TableText } from "@patternfly/react-table";
import copy from "copy-to-clipboard";
import React from "react";

interface Props {
  value: string;
}
export const CellValueWithCopy: React.FC<Props> = ({ value }) => (
  <TableText
    wrapModifier="truncate"
    // The real type of the tooltip property is ReactNode (the content property of the Tooltip component),
    // but the TableText wrapper specifies it as string
    tooltip={
      (
        <>
          {value}
          <CopyIcon
            aria-label="Copy to clipboard"
            onClick={() => copy(value)}
          />
        </>
      ) as unknown as string
    }
    tooltipProps={{ trigger: "mousenter focus click" }}
  >
    {value}
  </TableText>
);
