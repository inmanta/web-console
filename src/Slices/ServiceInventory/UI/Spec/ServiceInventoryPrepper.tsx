import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServiceModel } from "@/Core";
import { AuthProvider } from "@/Data/Auth/AuthProvider";
import { MockedDependencyProvider, Service } from "@/Test";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ServiceInventory } from "@S/ServiceInventory/UI/ServiceInventory";

interface Handles {
  component: React.ReactElement;
}

export class ServiceInventoryPrepper {
  prep(service: ServiceModel = Service.a): Handles {
    const client = new QueryClient();
    const component = (
      <QueryClientProvider client={client}>
        <TestMemoryRouter initialEntries={["/?env=123"]}>
          <AuthProvider config={undefined}>
            <MockedDependencyProvider>
              <ServiceInventory serviceName={service.name} service={service} />
            </MockedDependencyProvider>
          </AuthProvider>
        </TestMemoryRouter>
      </QueryClientProvider>
    );

    return { component };
  }
}
