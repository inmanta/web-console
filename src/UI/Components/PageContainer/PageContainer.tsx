import React from "react";
import { PageSection, PageSectionProps } from "@patternfly/react-core";
import { PageTitle } from "../PageTitle";

interface Props extends PageSectionProps {
  pageTitle: string | React.ReactNode;
}

export const PageContainer: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  pageTitle,
  ...props
}) => (
  <>
    <PageSection hasBodyWrapper={false} padding={{ default: "noPadding" }}>
      <PageTitle role="heading">{pageTitle}</PageTitle>
    </PageSection>
    <PageSection
      hasBodyWrapper={false}
      {...props}
      isFilled
      padding={{ default: "padding" }}
    >
      {children}
    </PageSection>
  </>
);
