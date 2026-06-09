import React, { useContext, useLayoutEffect } from "react";
import { Navigate } from "react-router";
import { EnvironmentRole } from "@/Core";
import { EnvironmentPreview } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { words } from "@/UI/words";
import { PageFrame } from "./PageFrame";

interface Props {
  environmentRole: EnvironmentRole;
}

export const Provider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  environmentRole,
}) => {
  const { environmentHandler, routeManager } = useContext(DependencyContext);
  const environment = environmentHandler.useSelected();
  const allEnvironments = environmentHandler.useAll();
  const { notifyInfo } = useAppAlert();
  const environmentId = getEnvironmentId(environmentRole, environment);

  const redirectingToCreateEnv =
    environmentId === words("error.environment.missing") && allEnvironments.length === 0;

  // useLayoutEffect fires before any useEffect, including Navigate's, so the alert
  // is committed to AppAlertProvider's state before the navigation unmounts this component.
  useLayoutEffect(() => {
    if (redirectingToCreateEnv) {
      notifyInfo({
        title: words("home.noEnvironments.toast.title"),
        message: words("home.noEnvironments.toast.message"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (environmentId === words("error.environment.missing")) {
    if (allEnvironments.length > 0) {
      return (
        <Navigate
          to={`${routeManager.getUrl("Dashboard", undefined)}?env=${allEnvironments[0].id}`}
          replace
        />
      );
    }

    return <Navigate to={routeManager.getUrl("CreateEnvironment", undefined)} replace />;
  }

  return <PageFrame environmentId={environmentId}>{children}</PageFrame>;
};

const getEnvironmentId = (
  environmentRole: EnvironmentRole,
  environment: EnvironmentPreview | undefined
): string | undefined => {
  if (environmentRole === "Forbidden") {
    return undefined;
  }

  if (environmentRole === "Required") {
    if (environment) {
      return environment.id;
    }

    return words("error.environment.missing");
  }

  if (environment) {
    return environment.id;
  }

  return undefined;
};
