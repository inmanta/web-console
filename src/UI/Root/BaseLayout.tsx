import React from "react";
import styled from "styled-components";
import { Page } from "@patternfly/react-core";
import { AppWrapper } from "./AppLayout/AppWrapper";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  shouldUseAuth: boolean;
}

export const BaseLayout: React.FC<Props> = ({
  keycloak,
  shouldUseAuth,
  children,
}) => (
  <AppWrapper
    keycloak={shouldUseAuth ? keycloak : undefined}
    shouldUseAuth={shouldUseAuth}
  >
    <MainPage breadcrumb={<PageBreadcrumbs />}>{children}</MainPage>
  </AppWrapper>
);

const MainPage = styled(Page)`
  grid-area: mainpage;
  overflow: hidden;
`;
