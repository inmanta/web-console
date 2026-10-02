import React, { useMemo } from "react";
import { Stack } from "@patternfly/react-core";
import { ServiceModel, ServiceInstanceParams } from "@/Core";
import { usePaginatedTable } from "@/Data";
import { useGetInstances } from "@/Data/Queries";
import {
  EmptyView,
  ErrorView,
  InstanceCounts,
  LoadingView,
  PaginationWidget,
  SummaryLabel,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { TableControls } from "./Components";
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
      <Wrapper name={serviceName} service={service}>
        <Stack>
          <TableControls
            instanceSummary={
              service.instance_summary && (
                <InstanceCounts
                  summary={service.instance_summary}
                  filtering={{ activeLabel, onToggle: onToggleLabel }}
                />
              )
            }
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
        </Stack>
      </Wrapper>
    );
  }

  return (
    <Wrapper name={serviceName} service={service}>
      <LoadingView ariaLabel="ServiceInventory-Loading" />
    </Wrapper>
  );
};
