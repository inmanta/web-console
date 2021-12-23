import React from "react";
import { PageSection, PageSectionProps } from "@patternfly/react-core";
import styled from "styled-components";
import { PageTitle } from "../PageTitle";

interface Props extends PageSectionProps {
  title: string;
}

export const PageSectionWithTitle: React.FC<Props> = ({
  children,
  title,
  ...props
}) => (
  <PageSection variant="light" {...props}>
    <Container>
      <PageTitle>{title}</PageTitle>
      {children}
    </Container>
  </PageSection>
);

const Container = styled.div`
  padding-bottom: 300px;
`;
