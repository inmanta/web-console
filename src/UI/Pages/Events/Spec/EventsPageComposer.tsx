import React from "react";
import { SchedulerImpl, ServiceModel } from "@/Core";
import { StoreProvider } from "easy-peasy";
import { DeferredFetcher, Service } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  DataProviderImpl,
  EventsDataManager,
  EventsStateHelper,
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
    const scheduler = new SchedulerImpl(5000, (task) => ({
      effect: jest.fn(() => task.effect()),
      update: jest.fn((result) => task.update(result)),
    }));
    const eventsFetcher = new DeferredFetcher<"Events">();
    const eventsHelper = new EventsDataManager(
      eventsFetcher,
      new EventsStateHelper(store),
      scheduler
    );

    const dataProvider = new DataProviderImpl([eventsHelper]);

    const component = (
      <MemoryRouter>
        <DependencyProvider dependencies={{ dataProvider }}>
          <StoreProvider store={store}>
            <EventsPage
              environment={service.environment}
              service={service}
              instanceId="id1"
            />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    );

    return { component, scheduler, eventsFetcher };
  }
}
