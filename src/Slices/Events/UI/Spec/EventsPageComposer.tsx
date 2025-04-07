import React from "react";
import { MemoryRouter } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import { SchedulerImpl, ServiceModel } from "@/Core";
import { QueryResolverImpl, getStoreInstance } from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolverImpl,
  Service,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { EventsQueryManager, EventsStateHelper } from "@S/Events/Data";
import { Events } from "@S/Events/UI/Events";

interface Handles {
  component: React.ReactElement;
  scheduler: SchedulerImpl;
  apiHelper: DeferredApiHelper;
}

export class EventsPageComposer {
  compose (service: ServiceModel = Service.a): Handles {
    const store = getStoreInstance();
    const scheduler = new SchedulerImpl(5000);
    const apiHelper = new DeferredApiHelper();
    const eventsHelper = EventsQueryManager(
      apiHelper,
      EventsStateHelper(store),
      scheduler,
    );

    const queryResolver = new QueryResolverImpl(
      new DynamicQueryManagerResolverImpl([eventsHelper]),
    );

    const component = (
      <MemoryRouter>
        <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
          <StoreProvider store={store}>
            <Events service={service} instanceId="id1" />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    );

    return { component, scheduler, apiHelper };
  }
}
