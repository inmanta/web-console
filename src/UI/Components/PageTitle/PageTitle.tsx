import styled from "styled-components";
import { Title } from "@patternfly/react-core";

export const PageTitle = styled(Title).attrs(() => ({
  headingLevel: "h1",
}))`
  padding-bottom: var(--pf-global--spacer--md);
`;
