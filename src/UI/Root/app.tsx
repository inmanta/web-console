import * as React from "react";
import "@patternfly/react-core/dist/styles/base.css";
import { BrowserRouter as Router } from "react-router-dom";
import { AppWrapper } from "@/UI/Root/AppLayout/AppWrapper";
import { KeycloakInitOptions } from "keycloak-js";
import { KeycloakProvider } from "react-keycloak";
import { Spinner, Bullseye, Page, PageSidebar } from "@patternfly/react-core";
import { EnvironmentProvider } from "@/UI/Components";
import {
  EnvironmentHandlerProvider,
  DependencyResolver,
} from "@/UI/Dependency";
import { PageRouter } from "@/UI/Pages";
import { Sidebar } from "./AppLayout/Sidebar";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

const keycloakInitConfig = {
  onLoad: "login-required",
  flow: "implicit",
} as KeycloakInitOptions;

export const App: React.FunctionComponent<{
  keycloak: Keycloak.KeycloakInstance;
  shouldUseAuth: boolean;
}> = (props) => {
  const [isNavOpen, setIsNavOpen] = React.useState(true);
  const [isMobileView, setIsMobileView] = React.useState(false);
  const [isNavOpenMobile, setIsNavOpenMobile] = React.useState(false);
  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };
  const AppWithStore = (
    <>
      <Router>
        <EnvironmentHandlerProvider>
          <AppWrapper
            keycloak={props.shouldUseAuth ? props.keycloak : undefined}
            shouldUseAuth={props.shouldUseAuth}
            isNavOpen={isNavOpen}
            isMobileView={isMobileView}
            isNavOpenMobile={isNavOpenMobile}
            setIsNavOpen={setIsNavOpen}
            setIsNavOpenMobile={setIsNavOpenMobile}
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
                    style={{ gridArea: "mainpage" }}
                  >
                    <PageRouter />
                  </Page>
                </>
              )}
            />
          </AppWrapper>
        </EnvironmentHandlerProvider>
      </Router>
    </>
  );
  const LoadingSpinner = () => (
    <Bullseye>
      <Spinner size="xl" />
    </Bullseye>
  );

  if (props.shouldUseAuth) {
    return (
      <KeycloakProvider
        keycloak={props.keycloak}
        initConfig={keycloakInitConfig}
        LoadingComponent={<LoadingSpinner />}
      >
        {AppWithStore}
      </KeycloakProvider>
    );
  }
  return AppWithStore;
};
