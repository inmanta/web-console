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
import { useStoreState } from "@/UI/Store";
import { InventoryTable } from "@/UI/ServiceInventory";
import { InstanceModal, ButtonType } from "./InstanceModal";
import { AttributeModel, RemoteData, Query, ServiceModel } from "@/Core";
import { useKeycloak } from "react-keycloak";
import { KeycloakInstance } from "keycloak-js";
import { ServicesContext } from "@/UI/ServicesContext";

const EnvironmentProvider: React.FunctionComponent<{
  match: { params: { id: string } };
}> = ({ match }) => {
  const environmentId = useStoreState(
    (store) => store.environments.getSelectedEnvironment.id
  );
  if (!environmentId) return null;

  return (
    <PageSection className={"horizontally-scrollable"}>
      <ServiceProvider
        serviceName={match.params.id}
        environmentId={environmentId}
      />
    </PageSection>
  );
};

const ServiceProvider: React.FunctionComponent<{
  serviceName: string;
  environmentId: string;
}> = ({ serviceName, environmentId }) => {
  const { dataProvider } = useContext(ServicesContext);
  const query: Query.ServiceQuery = {
    kind: "Service",
    qualifier: { name: serviceName, environment: environmentId },
  };
  dataProvider.useSubscription(query);
  const data = dataProvider.useData<"Service">(query);
  if (!RemoteData.isSuccess(data)) return null;

  return (
    <ServiceInventory
      serviceName={serviceName}
      environmentId={environmentId}
      service={data.value}
    />
  );
};

const ServiceInventory: React.FunctionComponent<{
  serviceName: string;
  environmentId: string;
  service: ServiceModel;
}> = ({ serviceName, environmentId, service }) => {
  const inventoryUrl = `/lsm/v1/service_inventory/${serviceName}?include_deployment_progress=True`;
  // const services = useStoreState((store) => store.services);
  // const storeDispatch = useStoreDispatch();
  const [errorMessage, setErrorMessage] = React.useState("");
  const [instanceErrorMessage, setInstanceErrorMessage] = React.useState("");

  const shouldUseAuth =
    process.env.SHOULD_USE_AUTH === "true" || (globalThis && globalThis.auth);
  let keycloak;
  if (shouldUseAuth) {
    // The value will be always true or always false during one session
    [keycloak] = useKeycloak();
  }

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
      <Alert
        variant="danger"
        title={data.value}
        actionClose={
          <AlertActionCloseButton onClose={() => setErrorMessage("")} />
        }
      />
    );
  }

  const refreshInstances = async () => dataProvider.trigger(query);

  return (
    <InventoryContext.Provider
      value={{
        attributes: service.attributes,
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
            serviceEntity={service}
          />
        )}
      </Card>
    </InventoryContext.Provider>
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
  EnvironmentProvider as ServiceInventory,
  InventoryContext,
  IInventoryContextData,
};
