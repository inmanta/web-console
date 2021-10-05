import React from "react";
import { Page, PageSidebar } from "@patternfly/react-core";
import { EnvironmentProvider } from "@/UI/Components";
import {
  DependencyResolver,
  EnvironmentHandlerProvider,
} from "@/UI/Dependency";
import { PageRouter } from "@/UI/Pages";
import { AppWrapper } from "@/UI/Root/AppLayout/AppWrapper";
import { Sidebar } from "@/UI/Root/AppLayout/Sidebar";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  shouldUseAuth: boolean;
}

export const EnvSpecificContentLayout: React.FC<Props> = ({
  keycloak,
  shouldUseAuth,
}) => {
  const [isNavOpen, setIsNavOpen] = React.useState(true);
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
  return (
    <EnvironmentHandlerProvider>
      <AppWrapper
        keycloak={shouldUseAuth ? keycloak : undefined}
        shouldUseAuth={shouldUseAuth}
        isNavOpen={isNavOpen}
        onToggle={onToggle}
        withEnvSelector
      >
        <EnvironmentProvider
          Wrapper={({ children }) => <>{children}</>}
          Dependant={({ environment }) => (
            <>
              <DependencyResolver environment={environment} />
              <Page
                breadcrumb={<PageBreadcrumbs />}
                onPageResize={onPageResize}
                sidebar={
                  <PageSidebar
                    aria-label="PageSidebar"
                    nav={<Sidebar environment={environment} />}
                    isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen}
                    theme="dark"
                  />
                }
                style={{ gridArea: "mainpage", overflow: "hidden" }}
              >
                <PageRouter />
              </Page>
            </>
          )}
        />
      </AppWrapper>
    </EnvironmentHandlerProvider>
  );
};
