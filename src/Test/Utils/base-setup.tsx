import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/Data";
import { StaticScheduler, DeferredApiHelper, MockedDependencyProvider } from "@/Test";
import { BlockingModal } from "@/UI/Components";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { testClient } from "./react-query-setup";
import * as envModifier from "@/UI/Dependency/EnvironmentModifier";

export function baseSetup(Page: React.ReactNode, halted: boolean = false) {
  jest.spyOn(envModifier, "useEnvironmentModifierImpl").mockReturnValue({
    ...jest.requireActual("@/UI/Dependency/EnvironmentModifier"),
    useIsHalted: () => halted,
  });
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();

  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={["/"]}>
        <MockedDependencyProvider>
          <StoreProvider store={store}>
            <BlockingModal />
            {Page}
          </StoreProvider>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component, apiHelper, scheduler };
}
