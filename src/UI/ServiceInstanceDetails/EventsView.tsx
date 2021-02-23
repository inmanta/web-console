import { InstanceEvent, RemoteData, ServiceInstanceIdentifier } from "@/Core";
import { TabProps } from "@patternfly/react-core";
import React, { useContext } from "react";
import { ServicesContext } from "..";
import {
  EmptyFiller,
  FailedFiller,
  FillerResourceTable,
  LoadingFiller,
} from "../Components";
import { EventTable, EventTablePresenter } from "../InstanceEventView";
import { MomentDatePresenter } from "../ServiceInventory/Presenters";

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

  return RemoteData.fold<string, InstanceEvent[], JSX.Element | null>({
    notAsked: () => null,
    loading: () => (
      <FillerResourceTable
        filler={<LoadingFiller />}
        aria-label="ResourceTable-Loading"
      />
    ),
    failed: (error) => (
      <FillerResourceTable
        filler={<FailedFiller error={error} />}
        aria-label="ResourceTable-Failed"
      />
    ),
    success: (events) =>
      events.length === 0 ? (
        <FillerResourceTable
          filler={<EmptyFiller />}
          aria-label="ResourceTable-Empty"
        />
      ) : (
        <EventTable
          events={events}
          environmentId={qualifier.environment}
          tablePresenter={new EventTablePresenter(new MomentDatePresenter())}
          aria-label="EventTable-Success"
        />
      ),
  })(data);
};
