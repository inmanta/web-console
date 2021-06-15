import styled from "styled-components";
import { Title } from "@patternfly/react-core";
import React from "react";

const FirstLevelTitle: React.FC = ({ children, ...props }) => (
  <Title headingLevel="h1" {...props}>
    {children}
  </Title>
);
export const PageTitle = styled(FirstLevelTitle)`
  padding-bottom: var(--pf-global--spacer--xs);
`;
