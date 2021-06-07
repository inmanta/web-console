import React from "react";
import copy from "copy-to-clipboard";
import { Tooltip } from "@patternfly/react-core";
import { CopyIcon } from "@patternfly/react-icons";
import styled from "styled-components";

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
    <Container>
      {shortText}
      <Tooltip content={tooltipContent} entryDelay={200}>
        <StyledCopyIcon onClick={() => copy(fullText)} />
      </Tooltip>
    </Container>
  );
};

const StyledCopyIcon = styled(CopyIcon)`
  opacity: 0;
  padding-left: 5px;
`;

const Container = styled.span`
  &:hover > ${StyledCopyIcon} {
    opacity: 1;
  }
`;
