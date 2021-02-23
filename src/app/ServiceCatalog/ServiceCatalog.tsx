import React from "react";
import { PageSection, Alert } from "@patternfly/react-core";
import { CatalogDataList } from "./CatalogDataList";
import { useStoreState, useStoreDispatch } from "@/UI/Store";
import { useInterval } from "@app/Hooks/UseInterval";
import { fetchInmantaApi } from "../utils/fetchInmantaApi";
import { useKeycloak } from "react-keycloak";
import { ErrorView } from "@/UI/Components";
import { words } from "@/UI/words";

export const ServiceCatalogWithProvider: React.FC = () => {
  const environmentId = useStoreState(
    (store) => store.environments.getSelectedEnvironment.id
  );

  return environmentId ? (
    <ServiceCatalog environmentId={environmentId} />
  ) : (
    <PageSection
      className={"horizontally-scrollable"}
      aria-label="ServiceCatalog-Failed"
    >
      <ErrorView error={words("error.environment.missing")} />
    </PageSection>
  );
};

export const ServiceCatalog: React.FC<{ environmentId: string }> = ({
  environmentId,
}) => {
  const serviceCatalogUrl = "/lsm/v1/service_catalog";
  const store = useStoreState((store) => store);
  const storeDispatch = useStoreDispatch();
  const [errorMessage, setErrorMessage] = React.useState("");
  const servicesOfEnvironment = store.services.getServicesOfEnvironment(
    environmentId
  );
  const dispatch = (data) => storeDispatch.services.updateServices(data);
  const shouldUseAuth =
    process.env.SHOULD_USE_AUTH === "true" || (globalThis && globalThis.auth);
  const dispatchDelete = (data) => {
    const urlParts = data.urlEndpoint.split("/");
    const serviceName = urlParts[urlParts.length - 1];
    storeDispatch.services.removeSingleService(serviceName);
  };
  let keycloak;
  if (shouldUseAuth) {
    // The value will be always true or always false during one session
    [keycloak] = useKeycloak();
  }
  const requestParams = {
    urlEndpoint: serviceCatalogUrl,
    dispatch,
    isEnvironmentIdRequired: true,
    environmentId,
    setErrorMessage,
    keycloak,
  };
  React.useEffect(() => {
    fetchInmantaApi(requestParams);
  }, [dispatch, servicesOfEnvironment, requestParams]);
  useInterval(async () => await fetchInmantaApi(requestParams), 5000);

  return (
    <PageSection className="horizontally-scrollable">
      {errorMessage && <Alert variant="danger" title={errorMessage} />}
      <CatalogDataList
        services={servicesOfEnvironment}
        environmentId={environmentId}
        serviceCatalogUrl={serviceCatalogUrl}
        keycloak={keycloak}
        dispatch={dispatchDelete}
      />
    </PageSection>
  );
};
