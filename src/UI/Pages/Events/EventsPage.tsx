import React, { useContext, useState } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { EventParams, RemoteData, ServiceModel } from "@/Core";
import {
  ErrorView,
  LoadingView,
  EventsTablePresenter,
  EventsTableWrapper,
  EmptyView,
  EventsTableBody,
  Description,
  PaginationWidget,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { MomentDatePresenter } from "@/UI/Utils";
import { EventsTableControls } from "./EventsTableControls";
import { useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";

interface Props {
  service: ServiceModel;
  instanceId: string;
}

export const EventsPage: React.FC<Props> = ({ service, instanceId }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [sort, setSort] = useUrlStateWithSort({
    default: { name: "timestamp", order: "desc" },
    route: "Events",
  });

  const [filter, setFilter] = useState<EventParams.Filter>({});
  const [pageSize, setPageSize] = useUrlStateWithPageSize({ route: "Events" });
  const [data] = queryResolver.useContinuous<"Events">({
    kind: "Events",
    id: instanceId,
    service_entity: service.name,
    filter,
    sort,
    pageSize,
  });
  const tablePresenter = new EventsTablePresenter(new MomentDatePresenter());

  const states = service.lifecycle.states.map((state) => state.name).sort();

  return (
    <div>
      <Description>{words("events.caption")(instanceId)}</Description>

      <EventsTableControls
        filter={filter}
        setFilter={setFilter}
        states={states}
        paginationWidget={
          <PaginationWidget
            data={data}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        }
      />
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => <LoadingView aria-label="EventTable-Loading" />,
          failed: (error) => (
            <ErrorView
              title={words("events.failed.title")}
              message={words("events.failed.body")(error)}
              aria-label="EventTable-Failed"
            />
          ),
          success: (events) =>
            events.data.length === 0 ? (
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
