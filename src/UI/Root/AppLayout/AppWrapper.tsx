import * as React from "react";
import { PageHeader, PageHeaderTools } from "@patternfly/react-core";
import Logo from "!react-svg-loader!@images/logo.svg";
import { GlobalStyles } from "@/UI/Styles";
import { SimpleBackgroundImage } from "./SimpleBackgroundImage";
import { Profile, SettingsButton, EnvSelectorWithProvider } from "./Toolbar";
import { getUrl } from "@/UI/Routing";
import styled from "styled-components";

interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  children: React.ReactNode;
  shouldUseAuth: boolean;
  isNavOpen?: boolean;
  onToggle?: () => void;
  withEnv?: boolean;
}

export const AppWrapper: React.FunctionComponent<Props> = ({
  keycloak,
  children,
  shouldUseAuth,
  isNavOpen,
  withEnv,
  onToggle,
}) => {
  React.useEffect(() => {
    if (keycloak && !keycloak.profile) {
      keycloak.loadUserProfile();
    }
  }, [keycloak?.authenticated]);

  const Header = (
    <PageHeader
      logo={<Logo alt="Inmanta Logo" aria-label="Inmanta Logo" />}
      logoProps={{ href: getUrl("Home", undefined) }}
      headerTools={
        <PageHeaderTools>
          <SettingsButton isDisabled={!withEnv} />
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
