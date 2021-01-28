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
} from "@patternfly/react-core";
import { useStoreState, State, useStoreDispatch } from "easy-peasy";
import { IStoreModel } from "@app/Models/CoreModels";
import { InventoryTable } from "@/UI/Inventory";
import { useInterval } from "@app/Hooks/UseInterval";
import { fetchInmantaApi, IRequestParams } from "@app/utils/fetchInmantaApi";
import { InstanceModal, ButtonType } from "./InstanceModal";
import { IAttributeModel } from "@app/Models/LsmModels";
import { useKeycloak } from "react-keycloak";

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
  const projectStore = useStoreState(
    (store: State<IStoreModel>) => store.projects
  );
  const storeDispatch = useStoreDispatch<IStoreModel>();
  const [errorMessage, setErrorMessage] = React.useState("");
  const [instanceErrorMessage, setInstanceErrorMessage] = React.useState("");
  const instancesOfCurrentService = projectStore.serviceInstances.instancesOfService(
    serviceName
  );
  const environmentId = projectStore.environments.getSelectedEnvironment.id;
  const shouldUseAuth =
    process.env.SHOULD_USE_AUTH === "true" || (globalThis && globalThis.auth);
  let keycloak;
  if (shouldUseAuth) {
    // The value will be always true or always false during one session
    [keycloak] = useKeycloak();
  }
  const dispatchUpdateInstances = (data) =>
    storeDispatch.projects.serviceInstances.updateInstances({
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
    storeDispatch.projects.services.addSingleService(data);
  React.useEffect(() => {
    ensureServiceEntityIsLoaded(projectStore, serviceName, {
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
  const serviceEntity = projectStore.services.byId[serviceName];
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
                      <InstanceModal
                        buttonType={ButtonType.add}
                        serviceName={serviceEntity.name}
                        keycloak={keycloak}
                      />
                    </ToolbarItem>
                  </ToolbarGroup>
                </ToolbarContent>
              </Toolbar>
            </CardFooter>
            {instancesOfCurrentService.length > 0 && (
              <InventoryTable
                instances={instancesOfCurrentService}
                keycloak={keycloak}
              />
            )}
          </Card>
        </InventoryContext.Provider>
      )}
    </PageSection>
  );
};

async function ensureServiceEntityIsLoaded(
  projectStore,
  serviceName: string,
  requestParams: IRequestParams
) {
  const serviceEntity = projectStore.services.byId[serviceName];
  if (serviceEntity) {
    return;
  }
  await fetchInmantaApi(requestParams);
}

interface IInventoryContextData {
  attributes: IAttributeModel[];
  environmentId: string | undefined;
  inventoryUrl: string;
  setErrorMessage: React.Dispatch<string>;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  refresh: (data) => any;
}

const InventoryContext = React.createContext({} as IInventoryContextData);

export { ServiceInventory, InventoryContext, IInventoryContextData };
