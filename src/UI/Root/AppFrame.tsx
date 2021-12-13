import React, { useContext, useState } from "react";
import {
  Page,
  PageHeader,
  PageHeaderTools,
  PageHeaderToolsGroup,
  PageSidebar,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";
import { GlobalStyles } from "@/UI/Styles";
import { EnvironmentControls } from "./AppLayout/EnvironmentControls";
import { SimpleBackgroundImage } from "./AppLayout/SimpleBackgroundImage";
import {
  SettingsButton,
  DocumentationLink,
  Profile,
} from "./AppLayout/Toolbar";
import { Navigation } from "./Navigation";

/* eslint-disable-next-line import/no-unresolved */
import Logo from "!react-svg-loader!@images/logo.svg";

export const AppFrame: React.FC = ({ children }) => {
  const environment = undefined;
  const noEnv = true;
  const { routeManager } = useContext(DependencyContext);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isMobileView, setIsMobileView] = React.useState(false);
  const [isNavOpenMobile, setIsNavOpenMobile] = React.useState(false);
  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };
  const onNavToggleMobile = () => {
    setIsNavOpenMobile(!isNavOpenMobile);
  };
  const onNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };

  const onToggle = isMobileView ? onNavToggleMobile : onNavToggle;

  const Header = (
    <PageHeader
      logo={<Logo alt="Inmanta Logo" aria-label="Inmanta Logo" />}
      logoProps={{ href: routeManager.getUrl("Home", undefined) }}
      headerTools={<TopNavActions noEnv={noEnv} />}
      showNavToggle
      isNavOpen={isNavOpen}
      onNavToggle={onToggle}
    />
  );

  return (
    <>
      <GlobalStyles />
      <SimpleBackgroundImage />
      <Page
        onPageResize={onPageResize}
        header={Header}
        sidebar={
          <Sidebar
            isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen}
            environment={environment}
          />
        }
      >
        {children}
      </Page>
    </>
  );
};

const TopNavActions: React.FC<{ noEnv: boolean }> = ({ noEnv }) => {
  const { keycloakController } = useContext(DependencyContext);
  return (
    <PageHeaderTools>
      <PageHeaderToolsGroup>
        <SettingsButton isDisabled={noEnv} />
        <DocumentationLink />
      </PageHeaderToolsGroup>
      {keycloakController.isEnabled() && (
        <Profile keycloak={keycloakController.getInstance()} />
      )}
    </PageHeaderTools>
  );
};

const Sidebar: React.FC<{
  isNavOpen: boolean;
  environment: string | undefined;
}> = ({ isNavOpen, environment }) => {
  return (
    <PageSidebar
      aria-label="PageSidebar"
      nav={
        <Stack>
          <StackItem>
            <Navigation environment={environment} />
          </StackItem>
          {environment && (
            <>
              <StackItem isFilled />
              <StackItem>
                <EnvironmentControls />
              </StackItem>
            </>
          )}
        </Stack>
      }
      isNavOpen={isNavOpen}
      theme="dark"
    />
  );
};
