import { RemoteData, ServiceInstanceIdentifier } from "@/Core";
import React, { useContext } from "react";
import { ServicesContext } from "@/UI/ServicesContext";
import {
  EventsTable,
  EventsTableWrapper,
  EventsTablePresenter,
  LoadingView,
  ErrorView,
} from "@/UI/Components";

import { MomentDatePresenter } from "../Presenters";
import { TabProps } from "./ServiceInstanceDetails";
import { words } from "@/UI/words";

interface Props extends TabProps {
  qualifier: ServiceInstanceIdentifier;
}

export const EventsView: React.FC<Props> = ({ qualifier }) => {
  const { dataProvider } = useContext(ServicesContext);
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
