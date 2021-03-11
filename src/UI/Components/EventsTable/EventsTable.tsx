import React from "react";
import { InstanceEvent } from "@/Core";
import { EventsTablePresenter } from "./EventsTablePresenter";
import { EmptyView } from "@/UI/Components";
import { words } from "@/UI/words";
import { EventsTableBody } from "./EventsTableBody";
import { EventsTableWrapper } from "./EventsTableWrapper";

interface Props {
  events: InstanceEvent[];
  environmentId: string;
  tablePresenter: EventsTablePresenter;
}

export const EventsTable: React.FC<Props> = ({
  events,
  environmentId,
  tablePresenter,
}) =>
  events.length === 0 ? (
    <EventsTableWrapper
      tablePresenter={tablePresenter}
      wrapInTd
      aria-label="EventTable-Empty"
    >
      <EmptyView
        title={words("events.empty.title")}
        message={words("events.empty.body")}
      />
    </EventsTableWrapper>
  ) : (
    <EventsTableWrapper
      tablePresenter={tablePresenter}
      aria-label="EventTable-Success"
    >
      <EventsTableBody
        events={events}
        environmentId={environmentId}
        tablePresenter={tablePresenter}
      />
    </EventsTableWrapper>
  );
