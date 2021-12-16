import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Page } from "@patternfly/react-core";
import { Either, EnvironmentRole, FlatEnvironment } from "@/Core";
import { DependencyContext, DependencyResolver } from "@/UI/Dependency";
import { Header } from "@/UI/Root/Components/Header";
import { PageBreadcrumbs } from "@/UI/Root/Components/PageBreadcrumbs";
import { Sidebar } from "@/UI/Root/Components/Sidebar";
import { GlobalStyles } from "@/UI/Styles";
import { words } from "@/UI/words";
import { SimpleBackgroundImage } from "./SimpleBackgroundImage";

interface Props {
  environmentRole: EnvironmentRole;
}

const getEnvironmentId = (
  environmentRole: EnvironmentRole,
  environment: FlatEnvironment | undefined
): Either.Type<string, string | undefined> => {
  if (environmentRole === "Forbidden") return Either.right(undefined);
  if (environmentRole === "Required") {
    if (environment) return Either.right(environment.id);
    return Either.left(words("error.environment.missing"));
  }
  return Either.right(environment ? environment.id : undefined);
};

export const PageFrame: React.FC<Props> = ({ children, environmentRole }) => {
  const { environmentHandler, routeManager, keycloakController } =
    useContext(DependencyContext);
  const environment = environmentHandler.useSelected();

  const eitherEnvironmentId = getEnvironmentId(environmentRole, environment);
  const environmentId = Either.withFallback(undefined, eitherEnvironmentId);

  const keycloak = keycloakController.isEnabled()
    ? keycloakController.getInstance()
    : undefined;

  useEffect(() => {
    if (keycloak && !keycloak.profile) {
      keycloak.loadUserProfile();
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [keycloak?.authenticated]);

  return (
    <>
      {environmentId && <DependencyResolver environment={environmentId} />}
      <AppFrameInner environmentId={environmentId}>
        {Either.isLeft(eitherEnvironmentId) ? (
          <Navigate to={routeManager.getUrl("Home", undefined)} />
        ) : (
          children
        )}
      </AppFrameInner>
    </>
  );
};

interface InnerProps {
  environmentId?: string;
}

const AppFrameInner: React.FC<InnerProps> = ({ children, environmentId }) => {
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

  return (
    <>
      <GlobalStyles />
      <SimpleBackgroundImage />
      <Page
        breadcrumb={<PageBreadcrumbs />}
        onPageResize={onPageResize}
        header={
          <Header
            noEnv={!Boolean(environmentId)}
            isNavOpen={isNavOpen}
            onToggle={onToggle}
          />
        }
        sidebar={
          <Sidebar
            isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen}
            environment={environmentId}
          />
        }
      >
        {children}
      </Page>
    </>
  );
};
