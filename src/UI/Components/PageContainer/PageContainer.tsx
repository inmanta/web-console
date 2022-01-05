import React from "react";
import { PageSection, PageSectionProps } from "@patternfly/react-core";
import styled from "styled-components";
import { PageTitle } from "../PageTitle";

interface Props extends PageSectionProps {
  title: string;
}

export const PageContainer: React.FC<Props> = ({
  children,
  title,
  ...props
}) => (
  <PageSection variant="light" {...props}>
    <Wrapper>
      <PageTitle>{title}</PageTitle>
      {children}
    </Wrapper>
  </PageSection>
);

export const Wrapper = styled.div`
  padding-bottom: 300px;
`;
