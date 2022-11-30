import React from "react";
import styled from "styled-components";
import { ClipboardCopyButton } from "../ClipboardCopyButton";

interface Props {
  value: string;
  tooltipContent: string;
}

export const TextWithCopy: React.FC<React.PropsWithChildren<Props>> = ({
  value,
  tooltipContent,
  children,
  ...props
}) => {
  return (
    <Container {...props}>
      {children || value}
      <StyledCopyIcon value={value} tooltipContent={tooltipContent} />
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
