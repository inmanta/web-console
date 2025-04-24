import React, { act } from "react";
import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { axe, toHaveNoViolations } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import { dependencies } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { Mock } from "@S/Facts/Test";
import { FactsPage } from ".";

expect.extend(toHaveNoViolations);

function setup() {
  const store = getStoreInstance();

  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <DependencyProvider dependencies={dependencies}>
          <StoreProvider store={store}>
            <Page>
              <FactsPage />
            </Page>
          </StoreProvider>
        </DependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return {
    component,
    store,
  };
}

describe("FactsPage", () => {
  const response = {
    data: Mock.list,
    metadata: {
      total: 8,
      before: 0,
      after: 0,
      page_size: 8,
    },
    links: { self: "" },
  };
  const server = setupServer();

  beforeAll(() => server.listen());
  beforeEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN Facts page THEN shows table", async () => {
    server.use(
      http.get("/api/v2/facts", () => {
        return HttpResponse.json(response);
      })
    );
    const { component } = setup();

    render(component);

    const rows = await screen.findAllByRole("row", { name: "FactsRow" });

    expect(rows).toHaveLength(8);
    expect(within(rows[0]).getByRole("cell", { name: "2021/03/18 18:10:43" })).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN Facts page THEN sets sorting parameters correctly on click", async () => {
    let sorting = "";
    server.use(
      http.get("/api/v2/facts", ({ request }) => {
        const url = new URL(request.url);
        sorting = url.searchParams.get("sort") || "";

        return HttpResponse.json(response);
      })
    );
    const { component } = setup();

    render(component);

    const resourceIdButton = await screen.findByRole("button", {
      name: words("facts.column.resourceId"),
    });

    expect(resourceIdButton).toBeVisible();

    await userEvent.click(resourceIdButton);

    expect(sorting).toEqual("resource_id.asc");

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test.each`
    filterValue      | placeholderText                                  | filterUrlName
    ${"awsDeviceV2"} | ${words("facts.filters.name.placeholder")}       | ${"name"}
    ${"id123"}       | ${words("facts.filters.resourceId.placeholder")} | ${"resource_id"}
  `(
    "When using the $filterName filter of type $filterType with value $filterValue and text $placeholderText then the facts with that $filterUrlName should be fetched and shown",
    async ({ filterValue, placeholderText, filterUrlName }) => {
      server.use(
        http.get("/api/v2/facts", ({ request }) => {
          if (request.url.includes(`&filter.${filterUrlName}=${filterValue}`)) {
            return HttpResponse.json({
              ...response,
              data: response.data.slice(0, 4),
            });
          }
          return HttpResponse.json(response);
        })
      );
      const { component } = setup();

      render(component);

      expect(await screen.findAllByRole("row", { name: "FactsRow" })).toHaveLength(8);

      const input = await screen.findByPlaceholderText(placeholderText);

      await userEvent.type(input, `${filterValue}{enter}`);

      expect(await screen.findAllByRole("row", { name: "FactsRow" })).toHaveLength(4);

      await act(async () => {
        const results = await axe(document.body);

        expect(results).toHaveNoViolations();
      });
    }
  );

  test("GIVEN FactsView WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
    server.use(
      http.get("/api/v2/facts", ({ request }) => {
        if (request.url.includes("&end=fake-first-param")) {
          return HttpResponse.json({
            ...response,
            data: response.data.slice(0, 4),
          });
        }
        return HttpResponse.json({
          data: Mock.list,
          metadata: {
            total: 103,
            before: 0,
            after: 3,
            page_size: 100,
          },
          links: {
            self: "",
            next: "/fake-link?end=fake-first-param",
          },
        });
      })
    );

    const { component } = setup();

    render(component);

    expect(await screen.findAllByRole("row", { name: "FactsRow" })).toHaveLength(8);

    await userEvent.click(screen.getByLabelText("Go to next page"));

    expect(await screen.findAllByRole("row", { name: "FactsRow" })).toHaveLength(4);

    //sort on the second page
    const resourceIdButton = await screen.findByText("Name");

    expect(resourceIdButton).toBeVisible();

    await userEvent.click(resourceIdButton);

    expect(await screen.findAllByRole("row", { name: "FactsRow" })).toHaveLength(8);
  });
});
