import React, { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { Config } from "@/Core";
import { getStoreInstance } from "@/Data";
import { MockedDependencyProvider, Service } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import * as envModifier from "@/UI/Dependency/EnvironmentModifier";
import { ConfigList } from "./ConfigList";
expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const store = getStoreInstance();

  return {
    component: (config: Config) => (
      <QueryClientProvider client={testClient}>
        <MockedDependencyProvider>
          <StoreProvider store={store}>
            <ConfigList serviceName={Service.a.name} config={config} />
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

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});
