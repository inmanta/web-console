import React, { ReactNode } from "react";
import styled from "styled-components";
import { ClipboardCopyButton } from "../ClipboardCopyButton";

interface Props {
  shortText: ReactNode;
  fullText: string;
  tooltipContent: string;
}

export const TextWithCopy: React.FC<Props> = ({
  shortText,
  fullText,
  tooltipContent,
  ...props
}) => {
  return (
    <Container {...props}>
      {shortText}
      <StyledCopyIcon fullText={fullText} tooltipContent={tooltipContent} />
    </Container>
  );
};

const StyledCopyIcon = styled(ClipboardCopyButton)`
  opacity: 0;
  padding-left: 5px;
`;

const Container = styled.span`
  &:hover > ${StyledCopyIcon} {
    opacity: 1;
  }
`;
