import * as React from "react";
import { PageSection, Alert } from "@patternfly/react-core";
import { CatalogDataList } from "./CatalogDataList";
import { useStoreState, useStoreDispatch } from "@/UI/Store";
import { useInterval } from "@app/Hooks/UseInterval";
import { fetchInmantaApi } from "../utils/fetchInmantaApi";
import { useKeycloak } from "react-keycloak";

const ServiceCatalog: React.FC = () => {
  const serviceCatalogUrl = "/lsm/v1/service_catalog";
  const store = useStoreState((store) => store);
  const storeDispatch = useStoreDispatch();
  const [errorMessage, setErrorMessage] = React.useState("");
  const environmentId = store.environments.getSelectedEnvironment.id
    ? store.environments.getSelectedEnvironment.id
    : "";
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

export { ServiceCatalog };
