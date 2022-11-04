import React, { PropsWithChildren, useContext } from "react";
import { Bullseye } from "@patternfly/react-core";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { Spinner } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";

export const AuthProvider: React.FC<PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { keycloakController } = useContext(DependencyContext);

  if (!keycloakController.isEnabled()) return <>{children}</>;

  return (
    <ReactKeycloakProvider
      authClient={keycloakController.getInstance()}
      initOptions={keycloakController.getInitConfig()}
      LoadingComponent={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      {children}
    </ReactKeycloakProvider>
  );
};
