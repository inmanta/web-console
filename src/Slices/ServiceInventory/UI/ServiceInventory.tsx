import React, { ReactElement, createContext, useEffect } from "react";
import { ServiceModel, ServiceInstanceParams } from "@/Core";
import { useUrlStateWithFilter, useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { useGetInstances } from "@/Data/Managers/V2/ServiceInstance";
import { EmptyView, ErrorView, LoadingView, PaginationWidget } from "@/UI/Components";
import { words } from "@/UI/words";
import { TableControls } from "./Components";
import { TableProvider } from "./TableProvider";
import { Wrapper } from "./Wrapper";

interface Props {
  labelFiltering: {
    danger: string[];
    warning: string[];
    success: string[];
    info: string[];
    no_label: string[];
    onClick: (labels: string[]) => void;
  };
}

/**
 * The context for the Service Inventory component that provides label filtering and refetching functionality.
 */
export const ServiceInventoryContext = createContext<Props>({
  labelFiltering: {
    danger: [],
    warning: [],
    success: [],
    info: [],
    no_label: [],
    onClick: (_label) => null,
  },
});

/**
 * The Service Inventory component which continuously check for the service instances based on the service name.
 * @param {string} serviceName - The name of the service.
 * @param {ServiceModel} service - The service model.
 * @param {ReactElement | null} intro - The summary chart component as introduction for the inventory view.
 * @returns {React.FC} - The rendered Service Inventory component.
 */
export const ServiceInventory: React.FunctionComponent<{
  serviceName: string;
  service: ServiceModel;
  intro?: ReactElement | null;
}> = ({ serviceName, service, intro }) => {
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

  const [filter, setFilter] = useUrlStateWithFilter<ServiceInstanceParams.Filter>({
    route: "Inventory",
  });

  const { data, isError, error, isSuccess, refetch } = useGetInstances(serviceName, {
    sort,
    filter,
    pageSize,
    currentPage,
  }).useContinuous();

  /**
   * Filters the service lifecycle states based on the provided label.
   * @param {string | null} label - The label to filter by.
   * @returns {string[]} - An array of state names that have the specified label.
   */
  const filterLabels = (label: string | null): string[] => {
    return service.lifecycle.states
      .filter((state) => state.label === label)
      .map((state) => state.name);
  };

  //when sorting is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order]);

  if (isError) {
    return (
      <Wrapper name={serviceName}>
        {intro}
        <ErrorView message={error.message} retry={refetch} ariaLabel="ServiceInventory-Failed" />
      </Wrapper>
    );
  }

  if (isSuccess)
    return (
      <ServiceInventoryContext.Provider
        value={{
          labelFiltering: {
            danger: filterLabels("danger"),
            warning: filterLabels("warning"),
            success: filterLabels("success"),
            info: filterLabels("info"),
            no_label: filterLabels(null),
            onClick: (labels) => setFilter({ ...filter, state: labels }),
          },
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
          {data.data.length > 0 ? (
            <TableProvider
              aria-label="ServiceInventory-Success"
              instances={data.data}
              serviceEntity={service}
              sort={sort}
              setSort={setSort}
            />
          ) : (
            <EmptyView
              message={words("inventory.empty.message")(serviceName)}
              aria-label="ServiceInventory-Empty"
            />
          )}
        </Wrapper>
      </ServiceInventoryContext.Provider>
    );

  return (
    <Wrapper name={serviceName}>
      {intro}
      <LoadingView ariaLabel="ServiceInventory-Loading" />
    </Wrapper>
  );
};
