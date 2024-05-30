import React, { useContext, ReactElement, createContext } from "react";
import { RemoteData, ServiceModel, ServiceInstanceParams } from "@/Core";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PaginationWidget,
  ServiceProvider,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Chart, TableControls } from "./Components";
import { TableProvider } from "./TableProvider";
import { Wrapper } from "./Wrapper";

export const Page: React.FC = () => {
  const { service: serviceName } = useRouteParams<"Inventory">();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={PreppedServiceInventory}
    />
  );
};

const PreppedServiceInventory: React.FC<{ service: ServiceModel }> = ({
  service,
}) => (
  <ServiceInventory
    service={service}
    serviceName={service.name}
    intro={<Chart summary={service.instance_summary} />}
  />
);

interface ServiceInventoryContextProps {
  labels: {
    danger: string[];
    warning: string[];
    success: string[];
    info: string[];
    no_label: string[];
  };
  onClick: (labels: string[]) => void;
  refetch: () => void;
}
export const ServiceInventoryContext =
  createContext<ServiceInventoryContextProps>({
    labels: {
      danger: [],
      warning: [],
      success: [],
      info: [],
      no_label: [],
    },
    onClick: (_label) => {
      // Default to no-op
      return;
    },
    refetch: () => {
      // Default to no-op
      return;
    },
  });
export const ServiceInventory: React.FunctionComponent<{
  serviceName: string;
  service: ServiceModel;
  intro?: ReactElement | null;
}> = ({ serviceName, service, intro }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "Inventory",
  });

  const [sort, setSort] = useUrlStateWithSort<string>({
    default: { name: "created_at", order: "desc" },
    route: "Inventory",
  });

  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Inventory",
  });

  const [filter, setFilter] =
    useUrlStateWithFilter<ServiceInstanceParams.Filter>({ route: "Inventory" });

  const [data, retry] = queryResolver.useContinuous<"GetServiceInstances">({
    kind: "GetServiceInstances",
    name: serviceName,
    sort,
    filter,
    pageSize,
    currentPage,
  });

  const filterLabels = (label: string | null) => {
    return service.lifecycle.states
      .filter((state) => state.label === label)
      .map((state) => state.name);
  };
  return (
    <ServiceInventoryContext.Provider
      value={{
        labels: {
          danger: filterLabels("danger"),
          warning: filterLabels("warning"),
          success: filterLabels("success"),
          info: filterLabels("info"),
          no_label: filterLabels(null),
        },
        onClick: (labels) => setFilter({ ...filter, state: labels }),
        refetch: retry,
      }}
    >
      <Wrapper name={serviceName}>
        {intro}
        <TableControls
          serviceName={serviceName}
          filter={filter}
          setFilter={setFilter}
          service={service}
          paginationWidget={
            <PaginationWidget
              data={data}
              pageSize={pageSize}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
            />
          }
        />
        {RemoteData.fold(
          {
            notAsked: () => null,
            loading: () => <LoadingView ariaLabel="ServiceInventory-Loading" />,
            failed: (error) => (
              <ErrorView
                message={error}
                retry={retry}
                ariaLabel="ServiceInventory-Failed"
              />
            ),
            success: ({ data: instances }) =>
              instances.length > 0 ? (
                <TableProvider
                  aria-label="ServiceInventory-Success"
                  instances={instances}
                  serviceEntity={service}
                  sort={sort}
                  setSort={setSort}
                />
              ) : (
                <EmptyView
                  message={words("inventory.empty.message")(serviceName)}
                  aria-label="ServiceInventory-Empty"
                />
              ),
          },
          data,
        )}
      </Wrapper>
    </ServiceInventoryContext.Provider>
  );
};
