import React, { PropsWithChildren, useContext } from "react";
import { Bullseye } from "@patternfly/react-core";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { Spinner } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";

export const KeycloakProvider: React.FC<PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { authController } = useContext(DependencyContext);
  if (!authController.shouldAuthLocally() && authController.isEnabled())
    return (
      <ReactKeycloakProvider
        authClient={authController.getInstance()}
        initOptions={authController.getInitConfig()}
        LoadingComponent={
          <Bullseye>
            <Spinner />
          </Bullseye>
        }
      >
        {children}
      </ReactKeycloakProvider>
    );
  return <>{children}</>;
};
