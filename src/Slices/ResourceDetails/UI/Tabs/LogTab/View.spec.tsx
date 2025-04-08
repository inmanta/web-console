import React from "react";
import { MemoryRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { delay, HttpResponse } from "msw";
import { http } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import { dependencies } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ResourceLogs } from "@S/ResourceDetails/Data/Mock";
import { View } from "./View";

function setup() {
  const store = getStoreInstance();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const component = (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DependencyProvider dependencies={dependencies}>
          <StoreProvider store={store}>
            <View resourceId={"abc"} />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return {
    component,
  };
}
describe("ResourceLogsView", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN ResourceLogsView THEN shows resource logs", async () => {
    server.use(
      http.get("/api/v2/resource/abc/logs", () => {
        delay(100);

        return HttpResponse.json(ResourceLogs.response);
      })
    );
    const { component } = setup();

    render(component);

    expect(screen.getByRole("region", { name: "ResourceLogs-Loading" })).toBeVisible();

    expect(await screen.findByRole("grid", { name: "ResourceLogsTable" })).toBeVisible();

    const rows = await screen.findAllByRole("rowgroup", {
      name: "ResourceLogRow",
    });

    expect(rows).toHaveLength(3);
  });

  test("GIVEN ResourceLogsView WHEN filtered on message THEN only shows relevant logs", async () => {
    server.use(
      http.get("/api/v2/resource/abc/logs", ({ request }) => {
        if (request.url.includes("filter.message=failed")) {
          return HttpResponse.json({
            ...ResourceLogs.response,
            data: [ResourceLogs.response.data[0]],
          });
        }

        return HttpResponse.json(ResourceLogs.response);
      })
    );
    const { component } = setup();

    render(component);

    const messageFilter = await screen.findByRole("textbox", {
      name: "MessageFilter",
    });

    await userEvent.type(messageFilter, "failed{enter}");

    const row = await screen.findByRole("rowgroup", {
      name: "ResourceLogRow",
    });

    expect(row).toBeInTheDocument();
  });

  test("GIVEN ResourceLogsView WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
    server.use(
      http.get("/api/v2/resource/abc/logs", ({ request }) => {
        if (request.url.includes("&end=")) {
          return HttpResponse.json({
            ...ResourceLogs.response,
            data: ResourceLogs.response.data.slice(0, 1),
          });
        }

        return HttpResponse.json({
          ...ResourceLogs.response,
          metadata: {
            total: 103,
            before: 0,
            after: 3,
            page_size: 100,
          },
        });
      })
    );
    const { component } = setup();

    render(component);

    const rows = await screen.findAllByRole("rowgroup", {
      name: "ResourceLogRow",
    });

    expect(rows).toHaveLength(3);
    expect(screen.getByLabelText("Go to next page")).toBeEnabled();

    await userEvent.click(screen.getByLabelText("Go to next page"));

    const updatedRows = await screen.findAllByRole("rowgroup", {
      name: "ResourceLogRow",
    });

    expect(updatedRows).toHaveLength(1);

    //sort on the second page
    await userEvent.click(screen.getByText("Timestamp"));

    const initialRows = await screen.findAllByRole("rowgroup", {
      name: "ResourceLogRow",
    });

    expect(initialRows).toHaveLength(3);
  });
});
