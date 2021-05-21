import React from "react";
import { SchedulerImpl, ServiceModel } from "@/Core";
import { StoreProvider } from "easy-peasy";
import { DeferredFetcher, DynamicQueryManagerResolver, Service } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  EventsQueryManager,
  EventsStateHelper,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { EventsPage } from "../EventsPage";
import { MemoryRouter } from "react-router-dom";
import { UrlManagerImpl } from "@/UI/Routing";

export interface Handles {
  component: React.ReactElement;
  scheduler: SchedulerImpl;
  eventsFetcher: DeferredFetcher<"Events">;
}

export class EventsPageComposer {
  compose(service: ServiceModel = Service.A): Handles {
    const store = getStoreInstance();
    const scheduler = new SchedulerImpl(5000);
    const eventsFetcher = new DeferredFetcher<"Events">();
    const eventsHelper = new EventsQueryManager(
      eventsFetcher,
      new EventsStateHelper(store),
      scheduler,
      Service.A.environment
    );

    const queryResolver = new QueryResolverImpl(
      new DynamicQueryManagerResolver([eventsHelper])
    );
    const urlManager = new UrlManagerImpl("", Service.A.environment);

    const component = (
      <MemoryRouter>
        <DependencyProvider dependencies={{ queryResolver, urlManager }}>
          <StoreProvider store={store}>
            <EventsPage service={service} instanceId="id1" />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    );

    return { component, scheduler, eventsFetcher };
  }
}
