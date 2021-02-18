import React, { useContext } from "react";
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
import { useStoreState, useStoreDispatch } from "@/UI/Store";
import { InventoryTable } from "@/UI/ServiceInventory";
import { fetchInmantaApi, IRequestParams } from "@app/utils/fetchInmantaApi";
import { InstanceModal, ButtonType } from "./InstanceModal";
import { AttributeModel, RemoteData, Query } from "@/Core";
import { useKeycloak } from "react-keycloak";
import { KeycloakInstance } from "keycloak-js";
import { ServicesContext } from "@/UI/ServicesContext";

interface Props {
  match: {
    params: {
      id: string;
    };
  };
}

const Provider: React.FunctionComponent<Props> = ({ match }) => {
  const environmentId = useStoreState(
    (store) => store.environments.getSelectedEnvironment.id
  );
  if (!environmentId) return null;
  return (
    <ServiceInventory
      serviceName={match.params.id}
      environmentId={environmentId}
    />
  );
};

const ServiceInventory: React.FunctionComponent<{
  serviceName: string;
  environmentId: string;
}> = ({ serviceName, environmentId }) => {
  const inventoryUrl = `/lsm/v1/service_inventory/${serviceName}?include_deployment_progress=True`;
  const services = useStoreState((store) => store.services);
  const storeDispatch = useStoreDispatch();
  const [errorMessage, setErrorMessage] = React.useState("");
  const [instanceErrorMessage, setInstanceErrorMessage] = React.useState("");

  const shouldUseAuth =
    process.env.SHOULD_USE_AUTH === "true" || (globalThis && globalThis.auth);
  let keycloak;
  if (shouldUseAuth) {
    // The value will be always true or always false during one session
    [keycloak] = useKeycloak();
  }

  const dispatchEntity = (data) =>
    storeDispatch.services.addSingleService(data);

  /**
   * Fetch service ONCE
   */
  React.useEffect(() => {
    ensureServiceEntityIsLoaded(services, serviceName, {
      urlEndpoint: `/lsm/v1/service_catalog/${serviceName}`,
      dispatch: dispatchEntity,
      isEnvironmentIdRequired: true,
      environmentId,
      setErrorMessage,
      keycloak,
    });
  }, [serviceName, environmentId]);

  const { dataProvider } = useContext(ServicesContext);
  const query: Query.ServiceInstancesQuery = {
    kind: "ServiceInstances",
    qualifier: { name: serviceName, environment: environmentId || "" },
  };
  dataProvider.useSubscription(query);
  const data = dataProvider.useData<"ServiceInstances">(query);

  if (RemoteData.isNotAsked(data)) return null;
  if (RemoteData.isLoading(data)) return <div>loading...</div>;
  if (RemoteData.isFailed(data)) {
    return (
      <PageSection className={"horizontally-scrollable"}>
        <Alert
          variant="danger"
          title={data.value}
          actionClose={
            <AlertActionCloseButton onClose={() => setErrorMessage("")} />
          }
        />
      </PageSection>
    );
  }

  const serviceEntity = services.byId[serviceName];
  const refreshInstances = async () => dataProvider.trigger(query);

  return (
    <PageSection className={"horizontally-scrollable"}>
      {serviceEntity && (
        <InventoryContext.Provider
          value={{
            attributes: serviceEntity.attributes,
            environmentId,
            inventoryUrl: inventoryUrl.split("?")[0],
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
              <Alert
                variant="danger"
                title={instanceErrorMessage}
                actionClose={
                  <AlertActionCloseButton
                    data-cy="close-alert"
                    onClose={() => setInstanceErrorMessage("")}
                  />
                }
              />
            </AlertGroup>
          )}
          <Card>
            <Title serviceName={serviceName} keycloak={keycloak} />
            {data.value.length > 0 && (
              <InventoryTable
                instances={data.value}
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

const Title: React.FC<{ serviceName: string; keycloak: KeycloakInstance }> = ({
  serviceName,
  keycloak,
}) => (
  <CardFooter>
    <Toolbar>
      <ToolbarContent>
        <ToolbarGroup>
          <ToolbarItem> Showing instances of {serviceName}</ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem>
            <InstanceModal
              buttonType={ButtonType.add}
              serviceName={serviceName}
              keycloak={keycloak}
            />
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  </CardFooter>
);

async function ensureServiceEntityIsLoaded(
  services,
  serviceName: string,
  requestParams: IRequestParams
) {
  const serviceEntity = services.byId[serviceName];
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

export {
  Provider as ServiceInventory,
  InventoryContext,
  IInventoryContextData,
};
