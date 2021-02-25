import { InstanceEvent, RemoteData, ServiceInstanceIdentifier } from "@/Core";
import React, { useContext } from "react";
import { ServicesContext } from "..";
import { FailedFiller, LoadingFiller } from "../Components";
import {
  EventTable,
  EventTablePresenter,
  FillerEventTable,
} from "../InstanceEventView";
import { EmptyFiller } from "../InstanceEventView/EmptyFiller";
import { MomentDatePresenter } from "../ServiceInventory/Presenters";
import { TabProps } from "./ServiceInstanceDetails";

interface Props extends TabProps {
  qualifier: ServiceInstanceIdentifier;
}

export const EventsView: React.FC<Props> = ({ qualifier }) => {
  const { dataProvider } = useContext(ServicesContext);

  dataProvider.useSubscription({ kind: "Events", qualifier });
  const data = dataProvider.useData<"Events">({
    kind: "Events",
    qualifier,
  });
  const tablePresenter = new EventTablePresenter(new MomentDatePresenter());

  return RemoteData.fold<string, InstanceEvent[], JSX.Element | null>({
    notAsked: () => null,
    loading: () => (
      <FillerEventTable
        tablePresenter={tablePresenter}
        filler={<LoadingFiller />}
        wrapInTd
        aria-label="EventTable-Loading"
      />
    ),
    failed: (error) => (
      <FillerEventTable
        tablePresenter={tablePresenter}
        filler={<FailedFiller error={error} />}
        wrapInTd
        aria-label="EventTable-Failed"
      />
    ),
    success: (events) =>
      events.length === 0 ? (
        <FillerEventTable
          tablePresenter={tablePresenter}
          filler={<EmptyFiller />}
          wrapInTd
          aria-label="EventTable-Empty"
        />
      ) : (
        <FillerEventTable
          tablePresenter={tablePresenter}
          wrapInTd={false}
          filler={
            <EventTable
              events={events}
              environmentId={qualifier.environment}
              tablePresenter={tablePresenter}
            />
          }
          aria-label="EventTable-Success"
        />
      ),
  })(data);
};
