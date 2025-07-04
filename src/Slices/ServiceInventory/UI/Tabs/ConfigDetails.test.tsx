import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { Config } from "@/Core";
import { EnvironmentDetails, MockedDependencyProvider, ServiceInstance } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { ConfigDetails } from "./ConfigDetails";

function setup() {
  return {
    component: (config: Config) => (
      <QueryClientProvider client={testClient}>
        <MockedDependencyProvider env={{ ...EnvironmentDetails.env, halted: true }}>
          <ConfigDetails
            serviceInstanceIdentifier={{
              id: ServiceInstance.a.id,
              service_entity: ServiceInstance.a.service_entity,
              version: ServiceInstance.a.version,
            }}
            config={config}
            defaults={config}
          />
        </MockedDependencyProvider>
      </QueryClientProvider>
    ),
  };
}

it("Config Details takes environment halted status in account", async () => {
  const { component } = setup();
  const { rerender } = render(component({}));

  rerender(component({ enabled: true }));
  expect(await screen.findByRole("switch", { name: "enabled-True" })).toBeDisabled();
});
