import React from "react";
import { TextContent, Text, TextVariants } from "@patternfly/react-core";
import styled from "styled-components";

interface Props {
  className?: string;
  withSpace?: boolean;
}

export const Description: React.FC<Props> = ({
  children,
  className,
  withSpace,
}) => (
  <StyledTextContent className={className} $withSpace={withSpace}>
    <Text component={TextVariants.small}>{children}</Text>
  </StyledTextContent>
);

const StyledTextContent = styled(TextContent)<{ $withSpace?: boolean }>`
  ${(p) => (p.$withSpace ? "padding-bottom: 16px" : "")};
`;
