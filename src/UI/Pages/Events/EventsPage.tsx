import React, { useContext, useState } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { EventParams, RemoteData, ServiceModel, SortDirection } from "@/Core";
import {
  ErrorView,
  LoadingView,
  EventsTablePresenter,
  EventsTableWrapper,
  EmptyView,
  EventsTableBody,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { MomentDatePresenter } from "@/UI/Pages/ServiceInventory/Presenters";
import { PaginationWidget } from "@/UI/Components";
import { EventsTableControls } from "./EventsTableControls";

interface Props {
  service: ServiceModel;
  instanceId: string;
}

export const EventsPage: React.FC<Props> = ({ service, instanceId }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [order, setOrder] = useState<SortDirection>("desc");
  const sort = { name: "timestamp", order: order };
  const [filter, setFilter] = useState<EventParams.Filter>({});
  const [pageSize, setPageSize] = useState<number>(20);
  const [data] = queryResolver.useContinuous<"Events">({
    kind: "Events",
    id: instanceId,
    service_entity: service.name,
    filter,
    sort,
    pageSize,
  });

  const tablePresenter = new EventsTablePresenter(new MomentDatePresenter());
  const caption = words("events.caption")(instanceId);

  const states = service.lifecycle.states.map((state) => state.name).sort();
  const paginationWidget = RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => null,
      failed: () => null,
      success: ({ handlers, metadata }) => (
        <PaginationWidget
          handlers={handlers}
          metadata={metadata}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      ),
    },
    data
  );

  return (
    <div>
      <EventsTableControls
        filter={filter}
        setFilter={setFilter}
        states={states}
        paginationWidget={paginationWidget}
      />
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => (
            <EventsTableWrapper
              tablePresenter={tablePresenter}
              caption={caption}
              wrapInTd
              aria-label="EventTable-Loading"
              order={order}
              setOrder={setOrder}
            >
              <LoadingView />
            </EventsTableWrapper>
          ),
          failed: (error) => (
            <EventsTableWrapper
              tablePresenter={tablePresenter}
              caption={caption}
              wrapInTd
              aria-label="EventTable-Failed"
              order={order}
              setOrder={setOrder}
            >
              <ErrorView
                title={words("events.failed.title")}
                message={words("events.failed.body")(error)}
              />
            </EventsTableWrapper>
          ),
          success: (events) =>
            events.data.length === 0 ? (
              <EventsTableWrapper
                tablePresenter={tablePresenter}
                caption={caption}
                wrapInTd
                aria-label="EventTable-Empty"
                order={order}
                setOrder={setOrder}
              >
                <EmptyView
                  title={words("events.empty.title")}
                  message={words("events.empty.body")}
                />
              </EventsTableWrapper>
            ) : (
              <EventsTableWrapper
                tablePresenter={tablePresenter}
                caption={caption}
                aria-label="EventTable-Success"
                order={order}
                setOrder={setOrder}
              >
                <EventsTableBody
                  events={events.data}
                  tablePresenter={tablePresenter}
                />
              </EventsTableWrapper>
            ),
        },
        data
      )}
    </div>
  );
};
