import React from "react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { http } from "msw";
import { HttpResponse } from "msw";
import { delay } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import { dependencies } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ResourceHistory } from "@S/ResourceDetails/Data/Mock";
import { ResourceDetails } from "@S/ResourceDetails/Data/Mock";
import { ResourceHistoryView } from "./ResourceHistoryView";
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
            <ResourceHistoryView
              resourceId="abc"
              details={ResourceDetails.response.data}
            />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("ResourceHistoryView", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("ResourceHistoryView shows empty table", async () => {
    server.use(
      http.get("/api/v2/resource/abc/history", () => {
        delay(100);

        return HttpResponse.json({
          data: [],
          metadata: { total: 0, before: 0, after: 0, page_size: 10 },
          links: { self: "" },
        });
      }),
    );
    const { component } = setup();

    render(component);

    expect(
      screen.getByRole("region", { name: "ResourceHistory-Loading" }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("generic", { name: "ResourceHistory-Empty" }),
    ).toBeInTheDocument();
  });

  test("ResourceHistoryView shows error view", async () => {
    server.use(
      http.get("/api/v2/resource/abc/history", () => {
        return HttpResponse.json({ message: "error" }, { status: 500 });
      }),
    );
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("region", { name: "ResourceHistory-Error" }),
    ).toBeInTheDocument();
  });

  test("ResourceHistoryView shows success table", async () => {
    server.use(
      http.get("/api/v2/resource/abc/history", () => {
        return HttpResponse.json(ResourceHistory.response);
      }),
    );
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("region", { name: "ResourceHistory-Loading" }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("grid", { name: "ResourceHistory-Success" }),
    ).toBeInTheDocument();
  });

  test("ResourceHistoryView sets sorting parameters correctly on click", async () => {
    server.use(
      http.get("/api/v2/resource/abc/history", ({ request }) => {
        if (request.url.includes("&sort=date.asc")) {
          return HttpResponse.json({
            ...ResourceHistory.response,
            data: ResourceHistory.response.data.reverse(),
          });
        }

        return HttpResponse.json(ResourceHistory.response);
      }),
    );
    const { component } = setup();

    render(component);
    const stateButton = await screen.findByRole("button", { name: /date/i });

    expect(stateButton).toBeVisible();

    const rows = await screen.findAllByLabelText("Resource History Table Row");

    expect(rows[0]).toHaveTextContent("4 years ago2");
    expect(rows[1]).toHaveTextContent("4 years ago1");

    await userEvent.click(stateButton);

    const updatedRows = await screen.findAllByLabelText(
      "Resource History Table Row",
    );

    expect(updatedRows[0]).toHaveTextContent("4 years ago1");
    expect(updatedRows[1]).toHaveTextContent("4 years ago2");
  });

  test("GIVEN The ResourceHistoryView WHEN the user clicks on the expansion toggle THEN the tabs are shown", async () => {
    server.use(
      http.get("/api/v2/resource/abc/history", () => {
        return HttpResponse.json(ResourceHistory.response);
      }),
    );
    const { component } = setup();

    render(component);

    expect(
      await screen.findByLabelText("ResourceHistory-Success"),
    ).toBeVisible();

    await userEvent.click(
      screen.getAllByRole("button", { name: "Details" })[0],
    );

    expect(
      screen.getAllByRole("tab", { name: "Desired State" })[0],
    ).toBeVisible();
    expect(screen.getAllByRole("tab", { name: "Requires" })[0]).toBeVisible();
  });

  test("GIVEN The ResourceHistoryView WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
    server.use(
      http.get("/api/v2/resource/abc/history", ({ request }) => {
        if (request.url.includes("&end=")) {
          return HttpResponse.json({
            ...ResourceHistory.response,
            data: ResourceHistory.response.data.slice(0, 1),
            metadata: {
              total: 103,
              before: 100,
              after: 0,
              page_size: 100,
            },
          });
        }

        return HttpResponse.json({
          ...ResourceHistory.response,
          metadata: {
            total: 103,
            before: 0,
            after: 3,
            page_size: 100,
          },
          links: {
            ...ResourceHistory.response.links,
            next: "/fake-link?end=fake-first-param",
          },
        });
      }),
    );
    const { component } = setup();

    render(component);

    const rows = await screen.findAllByLabelText("Resource History Table Row");

    expect(rows).toHaveLength(2);

    const nextPageButton = screen.getByLabelText("Go to next page");

    expect(nextPageButton).toBeEnabled();

    await userEvent.click(nextPageButton);

    const updatedRows = await screen.findAllByLabelText(
      "Resource History Table Row",
    );

    expect(updatedRows).toHaveLength(1);

    //sort on the second page
    await userEvent.click(screen.getByRole("button", { name: "Date" }));

    const updatedRows1 = await screen.findAllByLabelText(
      "Resource History Table Row",
    );

    expect(updatedRows1).toHaveLength(2);
  });
});
