import { RemoteData, ServiceInstanceIdentifier } from "@/Core";
import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";
import {
  EventsTable,
  EventsTableWrapper,
  EventsTablePresenter,
  LoadingView,
  ErrorView,
} from "@/UI/Components";

import { MomentDatePresenter } from "../Presenters";
import { words } from "@/UI/words";

interface Props {
  qualifier: ServiceInstanceIdentifier;
}

export const EventsTab: React.FC<Props> = ({ qualifier }) => {
  const { dataProvider } = useContext(DependencyContext);
  const [data] = dataProvider.useContinuous<"Events">({
    kind: "Events",
    qualifier,
  });
  const tablePresenter = new EventsTablePresenter(new MomentDatePresenter());

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <EventsTableWrapper
          tablePresenter={tablePresenter}
          wrapInTd
          aria-label="EventTable-Loading"
        >
          <LoadingView />
        </EventsTableWrapper>
      ),
      failed: (error) => (
        <EventsTableWrapper
          tablePresenter={tablePresenter}
          wrapInTd
          aria-label="EventTable-Failed"
        >
          <ErrorView
            title={words("events.failed.title")}
            message={words("events.failed.body")(error)}
          />
        </EventsTableWrapper>
      ),
      success: (events) => (
        <EventsTable
          events={events}
          environmentId={qualifier.environment}
          tablePresenter={tablePresenter}
        />
      ),
    },
    data
  );
};
