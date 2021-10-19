import React from "react";
import styled from "styled-components";
import { Page } from "@patternfly/react-core";
import { AppWrapper } from "./AppLayout/AppWrapper";

interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  shouldUseAuth: boolean;
}

export const HomeLayout: React.FC<Props> = ({
  keycloak,
  shouldUseAuth,
  children,
}) => (
  <AppWrapper
    keycloak={shouldUseAuth ? keycloak : undefined}
    shouldUseAuth={shouldUseAuth}
  >
    <MainPage>{children}</MainPage>
  </AppWrapper>
);

const MainPage = styled(Page)`
  grid-area: mainpage;
  overflow: hidden;
`;
