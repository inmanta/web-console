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
import { Either, EnvironmentRole, FlatEnvironment } from "@/Core";
import { ErrorView } from "@/UI/Components";
import { DependencyContext, DependencyResolver } from "@/UI/Dependency";
import { GlobalStyles } from "@/UI/Styles";
import { words } from "@/UI/words";
import { EnvironmentControls } from "./AppLayout/EnvironmentControls";
import { SimpleBackgroundImage } from "./AppLayout/SimpleBackgroundImage";
import {
  SettingsButton,
  DocumentationLink,
  Profile,
  StatusButton,
  EnvSelectorWithProvider,
} from "./AppLayout/Toolbar";
import { Navigation } from "./Navigation";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

/* eslint-disable-next-line import/no-unresolved */
import Logo from "!react-svg-loader!@images/logo.svg";

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

export const AppFrame: React.FC<Props> = ({ children, environmentRole }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useSelected();

  const eitherEnvironmentId = getEnvironmentId(environmentRole, environment);
  const environmentId = Either.withFallback(undefined, eitherEnvironmentId);

  return (
    <>
      {environmentId && <DependencyResolver environment={environmentId} />}
      <AppFrameInner environmentId={environmentId}>
        {Either.isLeft(eitherEnvironmentId) ? (
          <ErrorView message={words("error.environment.missing")} />
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

  const header = (
    <PageHeader
      logo={<Logo alt="Inmanta Logo" aria-label="Inmanta Logo" />}
      logoProps={{ href: routeManager.getUrl("Home", undefined) }}
      headerTools={<TopNavActions noEnv={!Boolean(environmentId)} />}
      showNavToggle
      topNav={<EnvSelectorWithProvider />}
      isNavOpen={isNavOpen}
      onNavToggle={onToggle}
    />
  );

  return (
    <>
      <GlobalStyles />
      <SimpleBackgroundImage />
      <Page
        breadcrumb={<PageBreadcrumbs />}
        onPageResize={onPageResize}
        header={header}
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

const TopNavActions: React.FC<{ noEnv: boolean }> = ({ noEnv }) => {
  const { keycloakController } = useContext(DependencyContext);
  return (
    <PageHeaderTools>
      <PageHeaderToolsGroup>
        <StatusButton />
        <DocumentationLink />
        <SettingsButton isDisabled={noEnv} />
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
