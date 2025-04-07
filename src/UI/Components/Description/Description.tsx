import React from 'react';
import { Content, ContentVariants } from '@patternfly/react-core';
import styled from 'styled-components';

interface Props {
  className?: string;
  withSpace?: boolean;
}

export const Description: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  className,
  withSpace,
}) => (
  <StyledTextContent className={className} $withSpace={withSpace}>
    <Content component={ContentVariants.small}>{children}</Content>
  </StyledTextContent>
);

const StyledTextContent = styled(Content)<{ $withSpace?: boolean }>`
  ${(p) => (p.$withSpace ? 'padding-bottom: 16px' : '')};
`;
