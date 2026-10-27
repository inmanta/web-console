import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BlockingModal } from "@/UI/Components/BlockingModal";
import { TestMemoryRouter } from "@inmanta/web-console-core/Routing/TestMemoryRouter";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import { testClient } from "./react-query-setup";

export function baseSetup(Page: React.ReactNode) {
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

  return { component };
}
