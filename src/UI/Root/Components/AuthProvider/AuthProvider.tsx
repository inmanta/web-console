import React, { useContext } from "react";
import { KeycloakProvider } from "react-keycloak";
import { Bullseye } from "@patternfly/react-core";
import { Spinner } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";

export const AuthProvider: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { keycloakController } = useContext(DependencyContext);

  if (!keycloakController.isEnabled()) return <>{children}</>;

  return (
    <KeycloakProvider
      keycloak={keycloakController.getInstance()}
      initConfig={keycloakController.getInitConfig()}
      LoadingComponent={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      {children}
    </KeycloakProvider>
  );
};
