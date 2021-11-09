import React from "react";
import { PageSection, PageSectionProps } from "@patternfly/react-core";
import { PageTitle } from "../PageTitle";

export const PageSectionWithTitle: React.FC<
  PageSectionProps & { title: string }
> = ({ children, title, ...props }) => (
  <PageSection variant="light" {...props}>
    <PageTitle>{title}</PageTitle>
    {children}
  </PageSection>
);
