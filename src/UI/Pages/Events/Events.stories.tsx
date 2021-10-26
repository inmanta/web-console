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
import { Events } from "./Events";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  EventsQueryManager,
  EventsStateHelper,
  getStoreInstance,
} from "@/Data";
import { UrlManagerImpl } from "@/UI/Utils";
import { MemoryRouter } from "react-router";

export default {
  title: "Events",
  component: Events,
};

const Template: React.FC<{ events: InstanceEvent[] }> = ({ events }) => {
  const scheduler = new StaticScheduler();
  const { service_instance_id } = InstanceLog.a;
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new EventsQueryManager(
        new InstantFetcher<"GetInstanceEvents">({
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
        InstanceLog.a.environment
      ),
    ])
  );
  const urlManager = new UrlManagerImpl("", InstanceLog.a.environment);

  return (
    <MemoryRouter>
      <DependencyProvider dependencies={{ queryResolver, urlManager }}>
        <StoreProvider store={store}>
          <Events service={Service.a} instanceId={service_instance_id} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );
};

export const Empty: React.FC = () => <Template events={[]} />;

export const MultipleSuccessful: React.FC = () => (
  <Template events={Event.listA} />
);

export const MultipleTypes: React.FC = () => <Template events={Event.listB} />;
