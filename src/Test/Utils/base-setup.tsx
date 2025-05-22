import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MockedDependencyProvider } from "@/Test";
import { BlockingModal } from "@/UI/Components";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
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
