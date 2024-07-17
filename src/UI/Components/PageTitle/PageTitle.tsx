import { Title } from "@patternfly/react-core";
import styled from "styled-components";

export const PageTitle = styled(Title).attrs(() => ({
  headingLevel: "h1",
}))`
  padding-bottom: var(--pf-v5-global--spacer--md);
`;
