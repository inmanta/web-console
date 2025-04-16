import React from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { StoreProvider } from "easy-peasy";
import { ServiceModel } from "@/Core";
import { getStoreInstance } from "@/Data";
import { dependencies, Service } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { DependencyProvider } from "@/UI/Dependency";
import { Events } from "@S/Events/UI/Events";

interface Handles {
  component: React.ReactElement;
}

export class EventsPageComposer {
  compose(service: ServiceModel = Service.a): Handles {
    const store = getStoreInstance();

    const component = (
      <QueryClientProvider client={testClient}>
        <MemoryRouter>
          <DependencyProvider dependencies={dependencies}>
            <StoreProvider store={store}>
              <Events service={service} instanceId="id1" />
            </StoreProvider>
          </DependencyProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    return { component };
  }
}
