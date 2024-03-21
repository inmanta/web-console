import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Either, EnvironmentRole, FlatEnvironment } from "@/Core";
import { DependencyContext, DependencyResolver } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { PageFrame } from "./PageFrame";
import { PageInitializer } from "./PageInitializer";

interface Props {
  environmentRole: EnvironmentRole;
}

export const Provider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  environmentRole,
}) => {
  const { environmentHandler, routeManager, authController } =
    useContext(DependencyContext);
  const environment = environmentHandler.useSelected();

  const eitherEnvironmentId = getEnvironmentId(environmentRole, environment);
  const environmentId = Either.withFallback(undefined, eitherEnvironmentId);

  const keycloak =
    authController.isEnabled() && !authController.shouldAuthLocally()
      ? authController.getInstance()
      : undefined;

  useEffect(() => {
    if (keycloak && !keycloak.profile) {
      keycloak.loadUserProfile();
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [keycloak?.authenticated]);

  return (
    <>
      {environmentId && (
        <>
          <PageInitializer environment={environmentId} />
          <DependencyResolver environment={environmentId} />
        </>
      )}
      <PageFrame environmentId={environmentId}>
        {Either.isLeft(eitherEnvironmentId) ? (
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
  environment: FlatEnvironment | undefined,
): Either.Type<string, string | undefined> => {
  if (environmentRole === "Forbidden") return Either.right(undefined);
  if (environmentRole === "Required") {
    if (environment) return Either.right(environment.id);
    return Either.left(words("error.environment.missing"));
  }
  return Either.right(environment ? environment.id : undefined);
};
