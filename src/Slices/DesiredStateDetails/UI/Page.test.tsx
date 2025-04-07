import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import { dependencies, Resource } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { DependencyProvider } from "@/UI/Dependency";
import { Page } from "./Page";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const store = getStoreInstance();

  const component = (
    <QueryClientProvider client={testClient}>
      <MemoryRouter>
        <DependencyProvider dependencies={dependencies}>
          <StoreProvider store={store}>
            <Page version="123" />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}
describe("DesiredStateDetails", () => {
  const server = setupServer();

  beforeAll(() => {
    server.listen();
  });
  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => {
    server.close();
  });

  test("GIVEN DesiredStateDetails page THEN shows loading resource table", async () => {
    server.use(
      http.get("/api/v2/desiredstate/123", () => {
        return HttpResponse.json(Resource.responseFromVersion);
      }),
    );
    const { component } = setup();

    render(component);

    expect(
      screen.getByRole("region", { name: "VersionResourcesTable-Loading" }),
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateDetails page WHEN api returns no items THEN shows empty resource table", async () => {
    server.use(
      http.get("/api/v2/desiredstate/123", () => {
        return HttpResponse.json({
          ...Resource.responseFromVersion,
          data: [],
        });
      }),
    );
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("generic", {
        name: "VersionResourcesTable-Empty",
      }),
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateDetails page WHEN api returns error THEN shows error", async () => {
    server.use(
      http.get("/api/v2/desiredstate/123", () => {
        return HttpResponse.json(
          {
            message: "something went wrong",
          },
          { status: 500 },
        );
      }),
    );
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("region", {
        name: "VersionResourcesTable-Error",
      }),
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateDetails page WHEN api returns items THEN shows success resource table", async () => {
    server.use(
      http.get("/api/v2/desiredstate/123", () => {
        return HttpResponse.json(Resource.responseFromVersion);
      }),
    );

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("grid", {
        name: "VersionResourcesTable-Success",
      }),
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateDetails page WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
    server.use(
      http.get("/api/v2/desiredstate/123", ({ request }) => {
        if (request.url.includes("&end=fake-first-param")) {
          return HttpResponse.json({
            ...Resource.responseFromVersion,
            data: Resource.responseFromVersion.data.slice(0, 4),
          });
        }

        return HttpResponse.json({
          ...Resource.responseFromVersion,
          metadata: {
            total: 103,
            before: 0,
            after: 83,
            page_size: 20,
          },
          links: {
            self: "",
            next: "/fake-link?end=fake-first-param",
          },
        });
      }),
    );
    const { component } = setup();

    render(component);
    await screen.findByRole("grid", { name: "VersionResourcesTable-Success" });
    expect(screen.getAllByLabelText("Resource Table Row")).toHaveLength(6);
    expect(screen.getByLabelText("Go to next page")).toBeEnabled();

    //go to next page
    await userEvent.click(screen.getByLabelText("Go to next page"));

    await screen.findByRole("grid", { name: "VersionResourcesTable-Success" });
    expect(screen.getAllByLabelText("Resource Table Row")).toHaveLength(4);
    expect(screen.getByLabelText("Go to next page")).toBeDisabled();

    //sort on the second page
    await userEvent.click(screen.getByRole("button", { name: "Type" }));

    await screen.findByRole("grid", { name: "VersionResourcesTable-Success" });
    expect(screen.getAllByLabelText("Resource Table Row")).toHaveLength(6);
    expect(screen.getByLabelText("Go to next page")).toBeEnabled();
  });
});
