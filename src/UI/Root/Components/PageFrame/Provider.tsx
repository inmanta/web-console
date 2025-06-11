import React, { useContext } from "react";
import { Navigate } from "react-router";
import { EnvironmentRole } from "@/Core";
import { EnvironmentPreview } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";
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
  const environmentId = getEnvironmentId(environmentRole, environment);

  return (
    <>
      <PageFrame environmentId={environmentId}>
        {environmentId === words("error.environment.missing") ? (
          <Navigate to={routeManager.getUrl("Home", undefined)} />
        ) : (
          children
        )}
      </PageFrame>
    </>
  );
};

const getEnvironmentId = (
  environmentRole: EnvironmentRole,
  environment: EnvironmentPreview | undefined
): string | undefined => {
  if (environmentRole === "Forbidden") return undefined;

  if (environmentRole === "Required") {
    if (environment) return environment.id;

    return words("error.environment.missing");
  }

  if (environment) return environment.id;

  return undefined;
};
