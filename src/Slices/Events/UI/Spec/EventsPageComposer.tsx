import React from "react";
import { MemoryRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ServiceModel } from "@/Core";
import { MockedDependencyProvider, Service } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { Events } from "@S/Events/UI/Events";

interface Handles {
  component: React.ReactElement;
}

/**
 * EventsPageComposer is a test utility class that composes the Events component
 * with all necessary providers for testing purposes.
 *
 * @returns {Handles} An object containing the composed component
 */
export class EventsPageComposer {
  compose(service: ServiceModel = Service.a): Handles {
    const component = (
      <QueryClientProvider client={testClient}>
        <MemoryRouter>
          <MockedDependencyProvider>
            <Events service={service} instanceId="id1" />
          </MockedDependencyProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    return { component };
  }
}
