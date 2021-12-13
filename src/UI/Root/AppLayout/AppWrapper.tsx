import React, { useEffect, useContext } from "react";
import {
  PageHeader,
  PageHeaderTools,
  PageHeaderToolsGroup,
} from "@patternfly/react-core";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import { GlobalStyles } from "@/UI/Styles";
import { SimpleBackgroundImage } from "./SimpleBackgroundImage";
import {
  Profile,
  SettingsButton,
  EnvSelectorWithProvider,
  DocumentationLink,
} from "./Toolbar";
/* eslint-disable-next-line import/no-unresolved */
import Logo from "!react-svg-loader!@images/logo.svg";

interface Props {
  children: React.ReactNode;
  isNavOpen?: boolean;
  onToggle?: () => void;
  withEnv?: boolean;
}

export const AppWrapper: React.FunctionComponent<Props> = ({
  children,
  isNavOpen,
  withEnv,
  onToggle,
}) => {
  const { routeManager, keycloakController } = useContext(DependencyContext);
  const shouldUseAuth = keycloakController.isEnabled();
  const keycloak = shouldUseAuth ? keycloakController.getInstance() : undefined;
  useEffect(() => {
    if (keycloak && !keycloak.profile) {
      keycloak.loadUserProfile();
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [keycloak?.authenticated]);

  const Header = (
    <PageHeader
      logo={<Logo alt="Inmanta Logo" aria-label="Inmanta Logo" />}
      logoProps={{ href: routeManager.getUrl("Home", undefined) }}
      headerTools={
        <PageHeaderTools>
          <PageHeaderToolsGroup>
            <SettingsButton isDisabled={!withEnv} />
            <DocumentationLink />
          </PageHeaderToolsGroup>
          {shouldUseAuth && <Profile keycloak={keycloak} />}
        </PageHeaderTools>
      }
      showNavToggle={withEnv}
      topNav={withEnv ? <EnvSelectorWithProvider /> : undefined}
      isNavOpen={isNavOpen}
      onNavToggle={onToggle}
      style={{ backgroundColor: "transparent" }}
    />
  );

  return (
    <React.Fragment>
      <GlobalStyles />
      <SimpleBackgroundImage />
      <PageWrapper className="pf-c-page">
        {Header}
        {children}
      </PageWrapper>
    </React.Fragment>
  );
};

const PageWrapper = styled.div`
  grid-template-areas:
    "header header"
    "mainpage mainpage";
  background-color: transparent;
`;
