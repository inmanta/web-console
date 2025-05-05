import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { DeferredApiHelper, MockedDependencyProvider } from "@/Test";
import { BlockingModal } from "@/UI/Components";
import * as envModifier from "@/UI/Dependency/EnvironmentModifier";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { testClient } from "./react-query-setup";

export function baseSetup(Page: React.ReactNode, halted: boolean = false) {
  jest.spyOn(envModifier, "useEnvironmentModifierImpl").mockReturnValue({
    ...jest.requireActual("@/UI/Dependency/EnvironmentModifier"),
    useIsHalted: () => halted,
  });
  const apiHelper = new DeferredApiHelper();

  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={["/"]}>
        <MockedDependencyProvider>
          <BlockingModal />
          {Page}
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component, apiHelper };
}
