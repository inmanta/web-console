import React, { useCallback, useMemo, useState } from "react";
import { Stack, StackItem } from "@patternfly/react-core";
import { ServiceModel, ServiceInstanceParams } from "@/Core";
import { usePaginatedTable } from "@/Data";
import { useGetInstances } from "@/Data/Queries";
import {
  EmptyView,
  ErrorView,
  FilterDrawer,
  InstanceCounts,
  LoadingView,
  PaginationWidget,
  SummaryLabel,
  countActiveFilters,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { ConnectedFilterWidget, TableControls } from "./Components";
import { TableProvider } from "./TableProvider";
import { Wrapper } from "./Wrapper";
import { getActiveLabel, getLabelStates } from "./labelFilter";

/**
 * The Service Inventory component which continuously checks for the service instances.
 * The toolbar shows the instance counts per label, and clicking a label toggles a state filter.
 *
 * @props {object} props - The props of the component.
 *  @prop {string} serviceName - The name of the service.
 *  @prop {ServiceModel} service - The service model.
 *
 * @returns {React.FC} The rendered Service Inventory component.
 */
export const ServiceInventory: React.FunctionComponent<{
  serviceName: string;
  service: ServiceModel;
}> = ({ serviceName, service }) => {
  const { currentPage, setCurrentPage, pageSize, setPageSize, sort, setSort, filter, setFilter } =
    usePaginatedTable<ServiceInstanceParams.Filter>({
      route: "Inventory",
      defaultSort: { name: "created_at", order: "desc" },
    });

  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  const onCloseFilterWidget = useCallback(() => {
    setIsDrawerExpanded(false);
  }, []);

  const activeFilterCount = useMemo(() => countActiveFilters(filter), [filter]);

  const states = useMemo(
    () => service.lifecycle.states.map((state) => state.name).sort(),
    [service]
  );

  const { data, isError, error, isSuccess, refetch } = useGetInstances(serviceName).useContinuous(
    {
      sort,
      filter,
      pageSize,
      currentPage,
    },
    { keepPreviousData: true }
  );

  const activeLabel = useMemo(
    () => getActiveLabel(service.lifecycle.states, filter.state),
    [service, filter.state]
  );

  const onToggleLabel = (label: SummaryLabel) =>
    setFilter({
      ...filter,
      state: label === activeLabel ? undefined : getLabelStates(service.lifecycle.states, label),
    });

  if (isError) {
    return (
      <Wrapper name={serviceName} service={service}>
        <ErrorView message={error.message} retry={refetch} ariaLabel="ServiceInventory-Failed" />
      </Wrapper>
    );
  }

  if (isSuccess) {
    return (
      <Wrapper
        name={serviceName}
        service={service}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <TableControls
          instanceSummary={
            service.instance_summary && (
              <InstanceCounts
                summary={service.instance_summary}
                filtering={{ activeLabel, onToggle: onToggleLabel }}
              />
            )
          }
          paginationWidget={
            <PaginationWidget
              data={data}
              pageSize={pageSize}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
            />
          }
          onToggleFilters={() => setIsDrawerExpanded((prev) => !prev)}
          isDrawerExpanded={isDrawerExpanded}
          activeFilterCount={activeFilterCount}
        />
        <FilterDrawer
          isExpanded={isDrawerExpanded}
          panelContent={<ConnectedFilterWidget states={states} onClose={onCloseFilterWidget} />}
        >
          {data.data.length > 0 ? (
            <Stack style={{ flex: "1 1 auto", minHeight: 0, height: "100%" }}>
              <StackItem isFilled style={{ minHeight: 0, height: "100%", overflow: "auto" }}>
                <TableProvider
                  aria-label="ServiceInventory-Success"
                  instances={data.data}
                  serviceEntity={service}
                  sort={sort}
                  setSort={setSort}
                />
              </StackItem>
            </Stack>
          ) : (
            <EmptyView
              message={words("inventory.empty.message")(serviceName)}
              aria-label="ServiceInventory-Empty"
            />
          )}
        </FilterDrawer>
      </Wrapper>
    );
  }

  return (
    <Wrapper name={serviceName} service={service}>
      <LoadingView ariaLabel="ServiceInventory-Loading" />
    </Wrapper>
  );
};
