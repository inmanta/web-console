import React, { useContext, useState } from "react";
import {
  PageSection,
  Alert,
  Card,
  AlertActionCloseButton,
  AlertGroup,
} from "@patternfly/react-core";
import { words } from "@/UI/words";
import { TableProvider } from "./TableProvider";
import {
  RemoteData,
  ServiceModel,
  ServiceInstanceParams,
  SortDirection,
} from "@/Core";
import { useKeycloak } from "react-keycloak";
import { DependencyContext } from "@/UI/Dependency";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  ServiceProvider,
  EnvironmentProvider,
  PaginationWidget,
} from "@/UI/Components";
import { InventoryContext } from "./InventoryContext";
import { TableControls } from "./Components";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSection className={"horizontally-scrollable"} {...props}>
    <Card>{children}</Card>
  </PageSection>
);

export const ServiceInventoryWithProvider: React.FC<{
  match: { params: { id: string } };
}> = ({ match }) => {
  return (
    <EnvironmentProvider
      Wrapper={Wrapper}
      Dependant={({ environment }) => (
        <ServiceProvider
          serviceName={match.params.id}
          environmentId={environment}
          Wrapper={Wrapper}
          Dependant={({ service }) => (
            <ServiceInventory
              service={service}
              environmentId={environment}
              serviceName={match.params.id}
            />
          )}
        />
      )}
    />
  );
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

  const { dataProvider } = useContext(DependencyContext);
  const [sortColumn, setSortColumn] = useState<string | undefined>(
    "created_at"
  );
  const [order, setOrder] = useState<SortDirection | undefined>("desc");
  const sort =
    sortColumn && order ? { name: sortColumn, order: order } : undefined;
  const [filter, setFilter] = useState<ServiceInstanceParams.Filter>({});

  const [data, retry] = dataProvider.useContinuous<"ServiceInstances">({
    kind: "ServiceInstances",
    qualifier: {
      name: serviceName,
      environment: environmentId || "",
      sort,
      filter,
    },
  });

  const paginationWidget = RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => null,
      failed: () => null,
      success: ({ handlers, metadata }) => (
        <PaginationWidget
          handlers={handlers}
          metadata={metadata}
          pageSize={20}
        />
      ),
    },
    data
  );

  return (
    <Wrapper>
      <TableControls
        serviceName={serviceName}
        filter={filter}
        setFilter={setFilter}
        service={service}
        paginationWidget={paginationWidget}
      />
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => <LoadingView aria-label="ServiceInventory-Loading" />,
          failed: (error) => (
            <ErrorView
              message={error}
              retry={retry}
              aria-label="ServiceInventory-Failed"
            />
          ),
          success: ({ data: instances }) => (
            <InventoryContext.Provider
              value={{
                attributes: service.attributes,
                environmentId,
                inventoryUrl: `/lsm/v1/service_inventory/${serviceName}`,
                setErrorMessage: setInstanceErrorMessage,
                refresh: retry,
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
                <TableProvider
                  aria-label="ServiceInventory-Success"
                  instances={instances}
                  keycloak={keycloak}
                  serviceEntity={service}
                  sortColumn={sortColumn}
                  setSortColumn={setSortColumn}
                  order={order}
                  setOrder={setOrder}
                />
              ) : (
                <EmptyView
                  message={words("inventory.empty.message")(serviceName)}
                  aria-label="ServiceInventory-Empty"
                />
              )}
            </InventoryContext.Provider>
          ),
        },
        data
      )}
    </Wrapper>
  );
};
