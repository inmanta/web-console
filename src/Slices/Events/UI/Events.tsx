import React, { useEffect } from "react";
import { ServiceModel } from "@/Core";
import { useUrlStateWithFilter, useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { useGetInstanceEvents } from "@/Data/Queries/V2/ServiceInstance/GetEvents";
import {
  EventsTablePresenter,
  EventsTableWrapper,
  EmptyView,
  EventsTableBody,
  PaginationWidget,
  LoadingView,
  ErrorView,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { Filter } from "@/Slices/Events/Core/Types";
import { EventsTableControls } from "./EventsTableControls";

interface Props {
  service: ServiceModel;
  instanceId: string;
}

/**
 * Events component displays a table of events for a service instance
 * 
 * 
 * @props {Props} props - Component properties
 * @prop {ServiceModel} service - The service model containing lifecycle states
 * @prop {string} instanceId - The ID of the service instance to fetch events for

 * @returns {React.FC<Props>} The rendered Events component
 */

export const Events: React.FC<Props> = ({ service, instanceId }) => {
  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "Events",
  });
  const [sort, setSort] = useUrlStateWithSort<string>({
    default: { name: "timestamp", order: "desc" },
    route: "Events",
  });
  const [filter, setFilter] = useUrlStateWithFilter<Filter>({
    route: "Events",
    keys: { timestamp: "DateRange" },
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({ route: "Events" });

  const { data, isSuccess, isError, error, refetch } = useGetInstanceEvents({
    id: instanceId,
    serviceName: service.name,
    filter,
    sort,
    pageSize,
    currentPage,
  }).useContinuous();

  const tablePresenter = new EventsTablePresenter();
  const states = service.lifecycle.states.map((state) => state.name).sort();

  //when sorting is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order]);

  if (isError) {
    return <ErrorView message={error.message} ariaLabel="EventTable-Error" retry={refetch} />;
  }

  if (isSuccess) {
    return (
      <div>
        <EventsTableControls
          filter={filter}
          setFilter={setFilter}
          states={states}
          paginationWidget={
            <PaginationWidget
              data={data}
              pageSize={pageSize}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
            />
          }
        />
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
      </div>
    );
  }

  return <LoadingView ariaLabel="EventTable-Loading" />;
};
