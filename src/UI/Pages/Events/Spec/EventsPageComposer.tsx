import React from "react";
import { SchedulerImpl, ServiceModel } from "@/Core";
import { StoreProvider } from "easy-peasy";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  Service,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  EventsQueryManager,
  EventsStateHelper,
  getStoreInstance,
} from "@/Data";
import { Events } from "@/UI/Pages/Events/Events";
import { MemoryRouter } from "react-router-dom";
import { UrlManagerImpl } from "@/UI/Utils";

export interface Handles {
  component: React.ReactElement;
  scheduler: SchedulerImpl;
  apiHelper: DeferredApiHelper;
}

export class EventsPageComposer {
  compose(service: ServiceModel = Service.a): Handles {
    const store = getStoreInstance();
    const scheduler = new SchedulerImpl(5000);
    const apiHelper = new DeferredApiHelper();
    const eventsHelper = new EventsQueryManager(
      apiHelper,
      new EventsStateHelper(store),
      scheduler,
      Service.a.environment
    );

    const queryResolver = new QueryResolverImpl(
      new DynamicQueryManagerResolver([eventsHelper])
    );
    const urlManager = new UrlManagerImpl("", Service.a.environment);

    const component = (
      <MemoryRouter>
        <DependencyProvider
          dependencies={{ ...dependencies, queryResolver, urlManager }}
        >
          <StoreProvider store={store}>
            <Events service={service} instanceId="id1" />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    );

    return { component, scheduler, apiHelper };
  }
}
