import React, { useContext, useState } from "react";
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
import { TableProvider } from "./TableProvider";
import { Pagination, Query, RemoteData, ServiceModel } from "@/Core";
import { useKeycloak } from "react-keycloak";
import { Link } from "react-router-dom";
import { PlusIcon } from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  ServiceProvider,
  EnvironmentProvider,
} from "@/UI/Components";
import { InventoryContext } from "./InventoryContext";
import { PaginationToolbar } from "./Components";
import { FilterView } from "./FilterView";

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
  const [order, setOrder] = useState<Query.SortDirection | undefined>("desc");
  const sort =
    sortColumn && order ? { name: sortColumn, order: order } : undefined;
  const [filter, setFilter] = useState<Query.Filter>({});

  const [data, retry] = dataProvider.useContinuous<"ServiceInstances">({
    kind: "ServiceInstances",
    qualifier: {
      name: serviceName,
      environment: environmentId || "",
      sort,
      filter,
    },
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <Wrapper aria-label="ServiceInventory-Loading">
          <LoadingView delay={500} />
        </Wrapper>
      ),
      failed: (error) => (
        <Wrapper aria-label="ServiceInventory-Failed">
          <ErrorView message={error} retry={retry} />
        </Wrapper>
      ),
      success: ({ data: instances, handlers, metadata }) => (
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
            <Wrapper aria-label="ServiceInventory-Success">
              <Bar
                serviceName={serviceName}
                handlers={handlers}
                metadata={metadata}
                filter={filter}
                setFilter={setFilter}
                service={service}
              />
              <TableProvider
                instances={instances}
                keycloak={keycloak}
                serviceEntity={service}
                sortColumn={sortColumn}
                setSortColumn={setSortColumn}
                order={order}
                setOrder={setOrder}
              />
            </Wrapper>
          ) : (
            <Wrapper aria-label="ServiceInventory-Empty">
              <Bar
                serviceName={serviceName}
                handlers={handlers}
                metadata={metadata}
                filter={filter}
                setFilter={setFilter}
                service={service}
              />
              <EmptyView
                message={words("inventory.empty.message")(serviceName)}
              />
            </Wrapper>
          )}
        </InventoryContext.Provider>
      ),
    },
    data
  );
};

interface BarProps {
  serviceName: string;
  handlers: Pagination.Handlers;
  metadata: Pagination.Metadata;
  filter: Query.Filter;
  setFilter: (filter: Query.Filter) => void;
  service: ServiceModel;
}

const Bar: React.FC<BarProps> = ({
  serviceName,
  handlers,
  metadata,
  filter,
  setFilter,
  service,
}) => {
  return (
    <CardFooter>
      <Toolbar clearAllFilters={() => setFilter({})}>
        <ToolbarContent>
          {
            <FilterView
              filter={filter}
              setFilter={setFilter}
              service={service}
            />
          }
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
          <PaginationToolbar handlers={handlers} metadata={metadata} />
        </ToolbarContent>
      </Toolbar>
    </CardFooter>
  );
};
