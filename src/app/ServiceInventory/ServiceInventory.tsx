import * as React from "react";
import {
  PageSection,
  Alert,
  Card,
  CardFooter,
  Toolbar,
  ToolbarGroup,
  AlertActionCloseButton,
  ToolbarItem,
  ToolbarContent,
  AlertGroup,
  Button,
} from "@patternfly/react-core";
import { useStoreState, useStoreDispatch } from "@/UI/Store";
import { InventoryTable } from "@/UI/ServiceInventory";
import { useInterval } from "@app/Hooks/UseInterval";
import { fetchInmantaApi, IRequestParams } from "@app/utils/fetchInmantaApi";
import { AttributeModel } from "@/Core";
import { useKeycloak } from "react-keycloak";
import { Link } from "react-router-dom";
import { words } from "@/UI";
import { PlusIcon } from "@patternfly/react-icons";
import { StateMapper } from "easy-peasy";
import { EnvironmentsSlice } from "@/UI/Store/EnvironmentsSlice";
import { ServicesSlice } from "@/UI/Store/ServicesSlice";
import { ProjectsSlice } from "@/UI/Store/ProjectsSlice";
import { ServiceInstancesSlice } from "@/UI/Store/ServiceInstancesSlice";

interface Props {
  match: {
    params: {
      id: string;
    };
  };
}

const ServiceInventory: React.FunctionComponent<Props> = (props) => {
  const serviceName = props.match.params.id;
  const inventoryUrl = `/lsm/v1/service_inventory/${serviceName}`;
  const store = useStoreState((store) => store);
  const storeDispatch = useStoreDispatch();
  const [errorMessage, setErrorMessage] = React.useState("");
  const [instanceErrorMessage, setInstanceErrorMessage] = React.useState("");
  const instancesOfCurrentService = store.serviceInstances.instancesWithTargetStates(
    serviceName
  );
  const environmentId = store.environments.getSelectedEnvironment.id;
  const shouldUseAuth =
    process.env.SHOULD_USE_AUTH === "true" || (globalThis && globalThis.auth);
  let keycloak;
  if (shouldUseAuth) {
    // The value will be always true or always false during one session
    [keycloak] = useKeycloak();
  }
  const dispatchUpdateInstances = (data) =>
    storeDispatch.serviceInstances.updateInstances({
      serviceName,
      instances: data,
    });
  const requestParams = {
    urlEndpoint: inventoryUrl,
    dispatch: dispatchUpdateInstances,
    isEnvironmentIdRequired: true,
    environmentId,
    setErrorMessage,
    keycloak,
  };
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
  React.useEffect(() => {
    fetchInmantaApi(requestParams);
  }, [storeDispatch, serviceName, instancesOfCurrentService, requestParams]);

  useInterval(() => fetchInmantaApi(requestParams), 5000);
  const serviceEntity = store.services.byId[serviceName];
  const refreshInstances = async () => fetchInmantaApi(requestParams);
  return (
    <PageSection className={"horizontally-scrollable"}>
      {serviceEntity && (
        <InventoryContext.Provider
          value={{
            attributes: serviceEntity.attributes,
            environmentId,
            inventoryUrl,
            setErrorMessage: setInstanceErrorMessage,
            refresh: refreshInstances,
          }}
        >
          {errorMessage && (
            <Alert
              variant="danger"
              title={errorMessage}
              actionClose={
                <AlertActionCloseButton onClose={() => setErrorMessage("")} />
              }
            />
          )}
          {instanceErrorMessage && (
            <AlertGroup isToast={true}>
              {" "}
              <Alert
                variant="danger"
                title={instanceErrorMessage}
                actionClose={
                  <AlertActionCloseButton
                    data-cy="close-alert"
                    onClose={() => setInstanceErrorMessage("")}
                  />
                }
              />{" "}
            </AlertGroup>
          )}
          <Card>
            <CardFooter>
              <Toolbar>
                <ToolbarContent>
                  <ToolbarGroup>
                    <ToolbarItem>
                      {" "}
                      Showing instances of {serviceName}
                    </ToolbarItem>{" "}
                  </ToolbarGroup>
                  <ToolbarGroup>
                    <ToolbarItem>
                      <Link
                        to={{
                          pathname: `/lsm/catalog/${serviceName}/inventory/add`,
                          search: location.search,
                        }}
                      >
                        <Button id="add-instance-button">
                          <PlusIcon /> {words("inventory.addInstance.button")}
                        </Button>
                      </Link>
                    </ToolbarItem>
                  </ToolbarGroup>
                </ToolbarContent>
              </Toolbar>
            </CardFooter>
            {instancesOfCurrentService.length > 0 && (
              <InventoryTable
                instances={instancesOfCurrentService}
                keycloak={keycloak}
                serviceEntity={serviceEntity}
              />
            )}
          </Card>
        </InventoryContext.Provider>
      )}
    </PageSection>
  );
};

export async function ensureServiceEntityIsLoaded(
  store: StateMapper<{
    environments: EnvironmentsSlice;
    services: ServicesSlice;
    projects: ProjectsSlice;
    serviceInstances: ServiceInstancesSlice;
  }>,
  serviceName: string,
  requestParams: IRequestParams
): Promise<void> {
  const serviceEntity = store.services.byId[serviceName];
  if (serviceEntity) {
    return;
  }
  await fetchInmantaApi(requestParams);
}

interface IInventoryContextData {
  attributes: AttributeModel[];
  environmentId: string | undefined;
  inventoryUrl: string;
  setErrorMessage: React.Dispatch<string>;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  refresh: (data) => any;
}

const InventoryContext = React.createContext({} as IInventoryContextData);

export { ServiceInventory, InventoryContext, IInventoryContextData };
