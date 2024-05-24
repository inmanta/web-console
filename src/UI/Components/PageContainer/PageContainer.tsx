import React from "react";
import { PageSection, PageSectionProps } from "@patternfly/react-core";
import { PageTitle } from "../PageTitle";
import { PagePadder } from "./PagePadder";

interface Props extends PageSectionProps {
  title: string;
}

export const PageContainer: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  title,
  ...props
}) => (
  <PageSection variant="light" {...props} role="main">
    <PagePadder>
      <PageTitle role="heading">{title}</PageTitle>
      {children}
    </PagePadder>
  </PageSection>
);
