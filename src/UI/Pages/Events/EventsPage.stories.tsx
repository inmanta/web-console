import React from "react";
import { InstanceEvent } from "@/Core";
import { StoreProvider } from "easy-peasy";
import {
  InstantFetcher,
  InstanceLog,
  Service,
  StaticScheduler,
  instanceEvents,
  ignoredErrorNormalEvents,
} from "@/Test";
import { EventsPage } from "./EventsPage";
import { DependencyProvider } from "@/UI/Dependency";
import { getStoreInstance } from "@/UI/Store";
import {
  DataProviderImpl,
  EventsDataManager,
  EventsStateHelper,
} from "@/UI/Data";

export default {
  title: "EventsPage",
  component: EventsPage,
};

const Template: React.FC<{ events: InstanceEvent[] }> = ({ events }) => {
  const scheduler = new StaticScheduler();
  const { service_instance_id, environment } = InstanceLog.A;
  const store = getStoreInstance();
  const dataProvider = new DataProviderImpl([
    new EventsDataManager(
      new InstantFetcher<"Events">({
        kind: "Success",
        data: {
          data: events,
          links: { self: "" },
          metadata: {
            total: events.length,
            before: 0,
            after: 0,
            page_size: 10,
          },
        },
      }),
      new EventsStateHelper(store),
      scheduler
    ),
  ]);

  return (
    <DependencyProvider dependencies={{ dataProvider }}>
      <StoreProvider store={store}>
        <EventsPage
          service={Service.A}
          instanceId={service_instance_id}
          environment={environment}
        />
      </StoreProvider>
    </DependencyProvider>
  );
};

export const Empty: React.FC = () => <Template events={[]} />;

export const MultipleSuccessful: React.FC = () => (
  <Template events={instanceEvents} />
);

export const MultipleTypes: React.FC = () => (
  <Template events={ignoredErrorNormalEvents} />
);
