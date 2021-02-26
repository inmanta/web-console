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
  Button,
} from "@patternfly/react-core";
import { words } from "@/UI/words";
import { useStoreState } from "@/UI/Store";
import { InventoryTable } from "@/UI/ServiceInventory";
import { AttributeModel, Query, RemoteData, ServiceModel } from "@/Core";
import { useKeycloak } from "react-keycloak";
import { Link } from "react-router-dom";
import { PlusIcon } from "@patternfly/react-icons";
import { ServicesContext } from "@/UI/ServicesContext";
import { KeycloakInstance } from "keycloak-js";
import { EmptyView, ErrorView, LoadingView } from "@/UI/Components";

const Wrapper: React.FC<{ "aria-label": string }> = ({
  children,
  ...props
}) => (
  <PageSection
    className={"horizontally-scrollable"}
    aria-label={props["aria-label"]}
  >
    <Card>{children}</Card>
  </PageSection>
);

export const ServiceInventoryWithProvider: React.FunctionComponent<{
  match: { params: { id: string } };
}> = ({ match }) => {
  const environmentId = useStoreState(
    (store) => store.environments.getSelectedEnvironment.id
  );

  return environmentId ? (
    <ServiceProvider
      serviceName={match.params.id}
      environmentId={environmentId}
    />
  ) : (
    <Wrapper aria-label="ServiceInventory-Failed">
      <ErrorView error={words("error.environment.missing")} delay={500} />
    </Wrapper>
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

  return RemoteData.fold<
    Query.Error<"Service">,
    Query.Data<"Service">,
    JSX.Element | null
  >({
    notAsked: () => null,
    loading: () => (
      <Wrapper aria-label="ServiceInventory-Loading">
        <LoadingView delay={500} />
      </Wrapper>
    ),
    failed: (error) => (
      <Wrapper aria-label="ServiceInventory-Failed">
        <ErrorView error={error} retry={() => dataProvider.trigger(query)} />
      </Wrapper>
    ),
    success: (service) => (
      <ServiceInventory
        serviceName={serviceName}
        environmentId={environmentId}
        service={service}
      />
    ),
  })(data);
};

export const ServiceInventory: React.FunctionComponent<{
  serviceName: string;
  environmentId: string;
  service: ServiceModel;
}> = ({ serviceName, environmentId, service }) => {
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

  return RemoteData.fold<
    Query.Error<"ServiceInstances">,
    Query.Data<"ServiceInstances">,
    JSX.Element | null
  >({
    notAsked: () => null,
    loading: () => (
      <Wrapper aria-label="ServiceInventory-Loading">
        <LoadingView delay={500} />
      </Wrapper>
    ),
    failed: (error) => (
      <Wrapper aria-label="ServiceInventory-Failed">
        <ErrorView error={error} retry={() => dataProvider.trigger(query)} />
      </Wrapper>
    ),
    success: (instances) => (
      <InventoryContext.Provider
        value={{
          attributes: service.attributes,
          environmentId,
          inventoryUrl: `/lsm/v1/service_inventory/${serviceName}`,
          setErrorMessage: setInstanceErrorMessage,
          refresh: () => dataProvider.trigger(query),
        }}
      >
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
        {instances.length > 0 ? (
          <Wrapper aria-label="ServiceInventory-Success">
            <IntroView serviceName={serviceName} keycloak={keycloak} />
            <InventoryTable
              instances={instances}
              keycloak={keycloak}
              serviceEntity={service}
            />
          </Wrapper>
        ) : (
          <Wrapper aria-label="ServiceInventory-Empty">
            <IntroView serviceName={serviceName} keycloak={keycloak} />
            <EmptyView
              message={words("inventory.empty.message")(serviceName)}
            />
          </Wrapper>
        )}
      </InventoryContext.Provider>
    ),
  })(data);
};

const IntroView: React.FC<{
  serviceName: string;
  keycloak: KeycloakInstance;
}> = ({ serviceName }) => (
  <CardFooter>
    <Toolbar>
      <ToolbarContent>
        <ToolbarGroup>
          <ToolbarItem>{words("inventory.intro")(serviceName)}</ToolbarItem>
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
);

export interface IInventoryContextData {
  attributes: AttributeModel[];
  environmentId: string | undefined;
  inventoryUrl: string;
  setErrorMessage: React.Dispatch<string>;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  refresh: (data) => any;
}

export const InventoryContext = React.createContext(
  {} as IInventoryContextData
);
