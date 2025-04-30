import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Config } from "@/Core";
import { getStoreInstance } from "@/Data";
import { MockedDependencyProvider, ServiceInstance } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import * as envModifier from "@/UI/Dependency/EnvironmentModifier";
import { ConfigDetails } from "./ConfigDetails";

function setup() {
  const store = getStoreInstance();

  return {
    component: (config: Config) => (
      <QueryClientProvider client={testClient}>
        <MockedDependencyProvider>
          <StoreProvider store={store}>
            <ConfigDetails
              serviceInstanceIdentifier={{
                id: ServiceInstance.a.id,
                service_entity: ServiceInstance.a.service_entity,
                version: ServiceInstance.a.version,
              }}
              config={config}
              defaults={config}
            />
          </StoreProvider>
        </MockedDependencyProvider>
      </QueryClientProvider>
    ),
  };
}

it("Config Details takes environment halted status in account", async () => {
  jest.spyOn(envModifier, "useEnvironmentModifierImpl").mockReturnValue({
    ...jest.requireActual("@/UI/Dependency/EnvironmentModifier"),
    useIsHalted: () => true,
  });
  const { component } = setup();
  const { rerender } = render(component({}));

  rerender(component({ enabled: true }));
  expect(await screen.findByRole("switch", { name: "enabled-True" })).toBeDisabled();
});
