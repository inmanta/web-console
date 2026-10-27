import React, { useCallback, useMemo, useState } from "react";
import { Filter } from "@/Slices/Events/Core/Types";
import {
  createEventsTablePresenter,
  EventsTableWrapper,
  EventsTableBody,
} from "@/UI/Components/EventsTable";
import { ServiceModel, words } from "@inmanta/web-console-core";
import { usePaginatedTable } from "@inmanta/web-console-core/Common";
import { useGetInstanceEvents } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { FilterDrawer, countActiveFilters } from "@inmanta/web-console-ui/Components/FilterDrawer";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PaginationWidget } from "@inmanta/web-console-ui/Components/PaginationWidget";
import { EventsTableControls } from "./EventsTableControls";
import { ConnectedFilterWidget } from "./FilterWidget";

interface Props {
  service: ServiceModel;
  instanceId: string;
}

/**
 * Events component displays a table of events for a service instance
 *
 * Filtering is handled in a side panel drawer: the toolbar exposes a toggle button
 * with an active filter count, and the filter form lives in the drawer panel.
 *
 * @props {Props} props - Component properties
 * @prop {ServiceModel} service - The service model containing lifecycle states
 * @prop {string} instanceId - The ID of the service instance to fetch events for
 *
 * @returns {React.FC<Props>} The rendered Events component
 */
export const Events: React.FC<Props> = ({ service, instanceId }) => {
  const { currentPage, setCurrentPage, pageSize, setPageSize, filter, sort, setSort } =
    usePaginatedTable<Filter>({
      route: "Events",
      filterKeys: { timestamp: "DateRange" },
      defaultSort: { name: "timestamp", order: "desc" },
    });

  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  const onCloseFilterWidget = useCallback(() => {
    setIsDrawerExpanded(false);
  }, []);

  const activeFilterCount = useMemo(() => countActiveFilters(filter), [filter]);

  const states = useMemo(
    () => service.lifecycle.states.map((state) => state.name).sort(),
    [service.lifecycle.states]
  );

  const { data, isSuccess, isError, error, refetch } = useGetInstanceEvents({
    id: instanceId,
    serviceName: service.name,
    filter,
    sort,
    pageSize,
    currentPage,
  }).useContinuous();

  const tablePresenter = createEventsTablePresenter();

  if (isError) {
    return <ErrorView message={error.message} ariaLabel="EventTable-Error" retry={refetch} />;
  }

  if (isSuccess) {
    return (
      <>
        <EventsTableControls
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
          {data.data.length === 0 ? (
            <EmptyView
              title={words("events.empty.title")}
              message={words("events.empty.body")}
              aria-label="EventTable-Empty"
            />
          ) : (
            <EventsTableWrapper
              tablePresenter={tablePresenter}
              aria-label="EventTable-Success"
              sort={sort}
              setSort={setSort}
            >
              <EventsTableBody route="Events" events={data.data} tablePresenter={tablePresenter} />
            </EventsTableWrapper>
          )}
        </FilterDrawer>
      </>
    );
  }

  return <LoadingView ariaLabel="EventTable-Loading" />;
};
