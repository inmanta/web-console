import React, { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Config, EnvironmentDetails, RemoteData } from "@/Core";
import { getStoreInstance } from "@/Data";
import { dependencies, ServiceInstance } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { DependencyProvider, EnvironmentModifierImpl } from "@/UI/Dependency";
import { ConfigDetails } from "./ConfigDetails";

function setup() {
  const store = getStoreInstance();

  store.dispatch.environment.setEnvironmentDetailsById({
    id: ServiceInstance.a.environment,
    value: RemoteData.success({ halted: false } as EnvironmentDetails),
  });
  const environmentModifier = EnvironmentModifierImpl();

  environmentModifier.setEnvironment(ServiceInstance.a.environment);

  return {
    component: (config: Config) => (
      <QueryClientProvider client={testClient}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            environmentModifier,
          }}
        >
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
        </DependencyProvider>
      </QueryClientProvider>
    ),
    store,
  };
}

it("Config Details takes environment halted status in account", async () => {
  const { component, store } = setup();
  const { rerender } = render(component({}));

  await act(async () => {
    store.dispatch.environment.setEnvironmentDetailsById({
      id: ServiceInstance.a.environment,
      value: RemoteData.success({ halted: true } as EnvironmentDetails),
    });
  });
  rerender(component({ enabled: true }));
  expect(
    await screen.findByRole("switch", { name: "enabled-True" }),
  ).toBeDisabled();
});
