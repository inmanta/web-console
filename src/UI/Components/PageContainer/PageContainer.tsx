import React from 'react';
import { Content, PageSection, PageSectionProps } from '@patternfly/react-core';

interface Props extends PageSectionProps {
  pageTitle: string | React.ReactNode;
}

export const PageContainer: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  pageTitle,
  ...props
}) => (
  <>
    <PageSection hasBodyWrapper={false}>
      <Content>
        <Content component="h1">{pageTitle}</Content>
      </Content>
    </PageSection>
    <PageSection
      hasBodyWrapper={false}
      {...props}
      isFilled
      padding={{ default: 'padding' }}
    >
      {children}
    </PageSection>
  </>
);
