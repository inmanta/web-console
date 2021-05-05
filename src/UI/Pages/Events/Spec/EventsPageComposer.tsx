import React from "react";
import { SchedulerImpl, ServiceModel } from "@/Core";
import { StoreProvider } from "easy-peasy";
import { DeferredFetcher, Service } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  DataProviderImpl,
  EventsDataManager,
  EventsStateHelper,
  UrlManagerImpl,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { EventsPage } from "../EventsPage";
import { MemoryRouter } from "react-router-dom";

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
    const eventsHelper = new EventsDataManager(
      eventsFetcher,
      new EventsStateHelper(store),
      scheduler,
      Service.A.environment
    );

    const dataProvider = new DataProviderImpl([eventsHelper]);
    const urlManager = new UrlManagerImpl("", Service.A.environment);

    const component = (
      <MemoryRouter>
        <DependencyProvider dependencies={{ dataProvider, urlManager }}>
          <StoreProvider store={store}>
            <EventsPage service={service} instanceId="id1" />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    );

    return { component, scheduler, eventsFetcher };
  }
}
