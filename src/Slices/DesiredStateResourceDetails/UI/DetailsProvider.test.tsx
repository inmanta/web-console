import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import { dependencies } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import * as VersionedResourceDetails from "@S/DesiredStateResourceDetails/Data/Mock";
import { DetailsProvider } from "./DetailsProvider";

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

  const component = (
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <DependencyProvider dependencies={dependencies}>
          <StoreProvider store={store}>
            <DetailsProvider version="123" resourceId="abc" />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("DetailsProvider", () => {
  const server = setupServer(
    http.get("/api/v2/desiredstate/123/resource/abc", () => {
      return HttpResponse.json({ data: VersionedResourceDetails.a });
    }),
  );

  beforeAll(() => {
    server.listen();
  });
  afterAll(() => {
    server.close();
  });

  test("GIVEN DesiredStateResourceDetails page WHEN api returns details THEN shows details", async () => {
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("generic", { name: "ResourceDetails-Success" }),
    ).toBeVisible();
    expect(screen.getByText("requires")).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
