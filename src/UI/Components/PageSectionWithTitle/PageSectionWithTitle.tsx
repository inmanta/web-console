import React from 'react';
import { Content, PageSection, PageSectionProps } from '@patternfly/react-core';

interface Props extends PageSectionProps {
  title: string;
}

export const PageSectionWithTitle: React.FC<Props> = ({
  children,
  title,
  ...props
}) => (
  <PageSection hasBodyWrapper={false} {...props}>
    <Content>
      <Content component="h1">{title}</Content>
      <Content>{children}</Content>
    </Content>
  </PageSection>
);
