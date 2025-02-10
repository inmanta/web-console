import React, { act } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { Config, EnvironmentDetails, RemoteData } from "@/Core";
import { getStoreInstance } from "@/Data";
import { dependencies, Service, ServiceInstance } from "@/Test";
import { DependencyProvider, EnvironmentModifierImpl } from "@/UI/Dependency";
import { ConfigList } from "./ConfigList";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const client = new QueryClient();

  const store = getStoreInstance();

  store.dispatch.environment.setEnvironmentDetailsById({
    id: Service.a.environment,
    value: RemoteData.success({ halted: false } as EnvironmentDetails),
  });
  const environmentModifier = EnvironmentModifierImpl();

  environmentModifier.setEnvironment(Service.a.environment);

  return {
    component: (config: Config) => (
      <QueryClientProvider client={client}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            environmentModifier,
          }}
        >
          <StoreProvider store={store}>
            <ConfigList serviceName={Service.a.name} config={config} />
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

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});
