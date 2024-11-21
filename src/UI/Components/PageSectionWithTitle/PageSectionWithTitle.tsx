import React from "react";
import { PageSection, PageSectionProps } from "@patternfly/react-core";
import { PageTitle } from "../PageTitle";

interface Props extends PageSectionProps {
  title: string;
}

export const PageSectionWithTitle: React.FC<Props> = ({
  children,
  title,
  ...props
}) => (
  <PageSection hasBodyWrapper={false} {...props}>
    <PageTitle>{title}</PageTitle>
    {children}
  </PageSection>
);
