import { ensureServiceEntityIsLoaded } from "@app/ServiceInventory/ServiceInventory";
import { Alert, AlertGroup, PageSection } from "@patternfly/react-core";
import React, { useCallback, useState } from "react";
import { useKeycloak } from "react-keycloak";
import { useHistory, useLocation } from "react-router-dom";
import { useStoreDispatch, useStoreState } from "../..";
import { CreateFormCard } from "./CreateFormCard";

interface Props {
  match: {
    params: {
      id: string;
    };
  };
}
export const CreateInstancePage: React.FC<Props> = ({ match }) => {
  const serviceName = match.params.id;
  const store = useStoreState((store) => store);
  const storeDispatch = useStoreDispatch();
  const environmentId = store.environments.getSelectedEnvironment.id;
  const shouldUseAuth =
    process.env.SHOULD_USE_AUTH === "true" || (globalThis && globalThis.auth);
  let keycloak;
  if (shouldUseAuth) {
    // The value will be always true or always false during one session
    [keycloak] = useKeycloak();
  }
  const [errorMessage, setErrorMessage] = useState("");
  const dispatchEntity = (data) =>
    storeDispatch.services.addSingleService(data);
  React.useEffect(() => {
    ensureServiceEntityIsLoaded(store, serviceName, {
      urlEndpoint: `/lsm/v1/service_catalog/${serviceName}`,
      dispatch: dispatchEntity,
      isEnvironmentIdRequired: true,
      environmentId,
      setErrorMessage,
      keycloak,
    });
  }, [serviceName, environmentId]);
  const serviceEntity = store.services.byId[serviceName];
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  pathParts.pop();
  const inventoryPath = pathParts.join("/").concat(location.search);
  const history = useHistory();
  const handleCancel = useCallback(() => history.push(`${inventoryPath}`), [
    history,
  ]);

  return (
    <>
      {serviceEntity && (
        <PageSection>
          {errorMessage && (
            <AlertGroup isToast>
              <Alert
                variant={"danger"}
                title={errorMessage}
                actionClose={() => setErrorMessage("")}
              />
            </AlertGroup>
          )}
          <CreateFormCard
            serviceEntity={serviceEntity}
            handleRedirect={handleCancel}
            keycloak={keycloak}
          />
        </PageSection>
      )}
    </>
  );
};
