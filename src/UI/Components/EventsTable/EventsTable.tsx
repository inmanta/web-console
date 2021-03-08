import React from "react";
import { InstanceEvent } from "@/Core";
import {
  EventTable as _EventTable,
  EventTablePresenter,
  FillerEventTable,
} from "@/UI/InstanceEventView";
import { MomentDatePresenter } from "@/UI/ServiceInventory/Presenters";
import { EmptyFiller } from "@/UI/InstanceEventView/EmptyFiller";

interface Props {
  events: InstanceEvent[];
  environmentId: string;
}

export const EventsTable: React.FC<Props> = ({ events, environmentId }) => {
  const tablePresenter = new EventTablePresenter(new MomentDatePresenter());
  return events.length === 0 ? (
    <FillerEventTable
      tablePresenter={tablePresenter}
      filler={<EmptyFiller />}
      wrapInTd
      aria-label="EventTable-Empty"
    />
  ) : (
    <FillerEventTable
      tablePresenter={tablePresenter}
      filler={
        <_EventTable
          events={events}
          environmentId={environmentId}
          tablePresenter={tablePresenter}
        />
      }
      aria-label="EventTable-Success"
    />
  );
};
