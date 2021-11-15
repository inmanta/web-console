import React from "react";
import { MemoryRouter } from "react-router";
import { StoreProvider } from "easy-peasy";
import { InstanceEvent } from "@/Core";
import {
  QueryResolverImpl,
  EventsQueryManager,
  EventsStateHelper,
  getStoreInstance,
} from "@/Data";
import {
  InstanceLog,
  Service,
  StaticScheduler,
  Event,
  DynamicQueryManagerResolver,
  InstantApiHelper,
  dependencies,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Events } from "./Events";

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
        new InstantApiHelper({
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
    ])
  );

  return (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
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
