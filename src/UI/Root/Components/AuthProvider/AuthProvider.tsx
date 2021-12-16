import React, { useContext } from "react";
import { KeycloakProvider } from "react-keycloak";
import { Spinner, Bullseye } from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";

export const AuthProvider: React.FC = ({ children }) => {
  const { keycloakController } = useContext(DependencyContext);

  if (!keycloakController.isEnabled()) return <>{children}</>;

  return (
    <KeycloakProvider
      keycloak={keycloakController.getInstance()}
      initConfig={keycloakController.getInitConfig()}
      LoadingComponent={
        <Bullseye>
          <Spinner size="xl" />
        </Bullseye>
      }
    >
      {children}
    </KeycloakProvider>
  );
};
