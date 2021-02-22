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
  EmptyState,
  EmptyStateIcon,
  Button,
  EmptyStateBody,
  Title,
  Spinner,
} from "@patternfly/react-core";
import { words } from "@/UI/words";
import { useStoreState } from "@/UI/Store";
import { InventoryTable } from "@/UI/ServiceInventory";
import { InstanceModal, ButtonType } from "./InstanceModal";
import { AttributeModel, RemoteData, Query, ServiceModel } from "@/Core";
import { useKeycloak } from "react-keycloak";
import { KeycloakInstance } from "keycloak-js";
import { ServicesContext } from "@/UI/ServicesContext";
import { ExclamationCircleIcon, SearchIcon } from "@patternfly/react-icons";

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
    <ErrorView error={words("error.environment.missing")} />
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
    loading: () => <LoadingView />,
    failed: (error) => (
      <ErrorView error={error} retry={() => dataProvider.trigger(query)} />
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
    loading: () => <LoadingView />,
    failed: (error) => (
      <ErrorView error={error} retry={() => dataProvider.trigger(query)} />
    ),
    success: (instances) =>
      instances.length <= 0 ? (
        <EmptyView />
      ) : (
        <Wrapper aria-label="ServiceInventory-Success">
          <InventoryContext.Provider
            value={{
              attributes: service.attributes,
              environmentId,
              inventoryUrl: `/lsm/v1/service_inventory/${serviceName}`,
              setErrorMessage: setInstanceErrorMessage,
              refresh: () => dataProvider.trigger(query),
            }}
            aria-label="ServiceInventory-Success"
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
            <IntroView serviceName={serviceName} keycloak={keycloak} />
            {instances.length > 0 && (
              <InventoryTable
                instances={instances}
                keycloak={keycloak}
                serviceEntity={service}
              />
            )}
          </InventoryContext.Provider>
        </Wrapper>
      ),
  })(data);
};

const IntroView: React.FC<{
  serviceName: string;
  keycloak: KeycloakInstance;
}> = ({ serviceName, keycloak }) => (
  <CardFooter>
    <Toolbar>
      <ToolbarContent>
        <ToolbarGroup>
          <ToolbarItem>{words("inventory.intro")(serviceName)}</ToolbarItem>
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

const LoadingView: React.FC = () => (
  <Wrapper aria-label="ServiceInventory-Loading">
    <EmptyState>
      <EmptyStateIcon variant="container" component={Spinner} />
      <Title size="lg" headingLevel="h4">
        {words("loading")}
      </Title>
    </EmptyState>
  </Wrapper>
);

const ErrorView: React.FC<{ error: string; retry?: () => void }> = ({
  error,
  retry,
}) => (
  <Wrapper aria-label="ServiceInventory-Failed">
    <EmptyState>
      <EmptyStateIcon icon={ExclamationCircleIcon} />
      <Title headingLevel="h4" size="lg">
        {words("error")}
      </Title>
      <EmptyStateBody>{error}</EmptyStateBody>
      <Button variant="primary" onClick={retry}>
        {words("retry")}
      </Button>
    </EmptyState>
  </Wrapper>
);

const EmptyView: React.FC = () => (
  <Wrapper aria-label="ServiceInventory-Empty">
    <EmptyState>
      <EmptyStateIcon icon={SearchIcon} />
      <Title size="lg" headingLevel="h4">
        {words("inventory.empty.title")}
      </Title>
      <EmptyStateBody>{words("inventory.empty.body")}</EmptyStateBody>
    </EmptyState>
  </Wrapper>
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
