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
    <PageSection variant="light" padding={{ default: "noPadding" }}>
      <PageTitle role="heading">{pageTitle}</PageTitle>
    </PageSection>
    <PageSection
      variant="light"
      {...props}
      role="main"
      isFilled
      padding={{ default: "padding" }}
    >
      {children}
    </PageSection>
  </>
);
