import React from "react";
import { InstanceEvent } from "@/Core";
import { StoreProvider } from "easy-peasy";
import {
  InstantFetcher,
  InstanceLog,
  Service,
  StaticScheduler,
  Event,
  DynamicQueryManagerResolver,
} from "@/Test";
import { EventsPage } from "./EventsPage";
import { DependencyProvider } from "@/UI/Dependency";
import { getStoreInstance } from "@/UI/Store";
import {
  QueryResolverImpl,
  EventsQueryManager,
  EventsStateHelper,
} from "@/UI/Data";
import { UrlManagerImpl } from "@/UI/Routing";

export default {
  title: "EventsPage",
  component: EventsPage,
};

const Template: React.FC<{ events: InstanceEvent[] }> = ({ events }) => {
  const scheduler = new StaticScheduler();
  const { service_instance_id } = InstanceLog.A;
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new EventsQueryManager(
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
        scheduler,
        InstanceLog.A.environment
      ),
    ])
  );
  const urlManager = new UrlManagerImpl("", InstanceLog.A.environment);

  return (
    <DependencyProvider dependencies={{ queryResolver, urlManager }}>
      <StoreProvider store={store}>
        <EventsPage service={Service.a} instanceId={service_instance_id} />
      </StoreProvider>
    </DependencyProvider>
  );
};

export const Empty: React.FC = () => <Template events={[]} />;

export const MultipleSuccessful: React.FC = () => (
  <Template events={Event.listA} />
);

export const MultipleTypes: React.FC = () => <Template events={Event.listB} />;
