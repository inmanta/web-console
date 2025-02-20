import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { Page } from "@patternfly/react-core";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { axe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  QueryManagerResolverImpl,
} from "@/Data";
import { DeferredApiHelper, dependencies, StaticScheduler } from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { Mock } from "@S/Facts/Test";
import { FactsPage } from ".";

expect.extend(toHaveNoViolations);

function setup() {
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <StoreProvider store={store}>
          <Page>
            <FactsPage />
          </Page>
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    apiHelper,
    scheduler,
    store,
  };
}

test("GIVEN Facts page THEN shows table", async () => {
  const { component, apiHelper } = setup();

  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/api/v2/facts?limit=20&sort=name.asc",
    environment: "env",
  });

  apiHelper.resolve(
    Either.right({
      data: Mock.list,
      metadata: {
        total: 8,
        before: 0,
        after: 0,
        page_size: 8,
      },
      links: { self: "" },
    }),
  );

  const rows = await screen.findAllByRole("row", { name: "FactsRow" });

  expect(rows).toHaveLength(8);
  expect(
    within(rows[0]).getByRole("cell", { name: "2021/03/18 18:10:43" }),
  ).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN Facts page THEN sets sorting parameters correctly on click", async () => {
  const { component, apiHelper } = setup();

  render(component);
  apiHelper.resolve(
    Either.right({
      data: Mock.list,
      metadata: {
        total: 8,
        before: 0,
        after: 0,
        page_size: 8,
      },
      links: { self: "" },
    }),
  );
  const resourceIdButton = await screen.findByRole("button", {
    name: words("facts.column.resourceId"),
  });

  expect(resourceIdButton).toBeVisible();

  await userEvent.click(resourceIdButton);

  expect(apiHelper.pendingRequests[0].url).toContain("&sort=resource_id.asc");

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
    const { component, apiHelper } = setup();

    render(component);

    apiHelper.resolve(
      Either.right({
        data: Mock.list,
        metadata: {
          total: 8,
          before: 0,
          after: 0,
          page_size: 8,
        },
        links: { self: "" },
      }),
    );

    expect(
      await screen.findAllByRole("row", { name: "FactsRow" }),
    ).toHaveLength(8);

    const input = await screen.findByPlaceholderText(placeholderText);

    await userEvent.type(input, `${filterValue}{enter}`);

    expect(apiHelper.pendingRequests[0].url).toEqual(
      `/api/v2/facts?limit=20&filter.${filterUrlName}=${filterValue}&sort=name.asc`,
    );

    apiHelper.resolve(
      Either.right({
        data: Mock.list.slice(undefined, 4),
        metadata: {
          total: 4,
          before: 0,
          after: 0,
          page_size: 20,
        },
        links: { self: "" },
      }),
    );

    expect(
      await screen.findAllByRole("row", { name: "FactsRow" }),
    ).toHaveLength(4);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  },
);

test("GIVEN FactsView WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
  const { component, apiHelper } = setup();

  render(component);

  //mock that response has more than one site
  await act(async () => {
    apiHelper.resolve(
      Either.right({
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
      }),
    );
  });

  expect(screen.getByLabelText("Go to next page")).toBeEnabled();

  await userEvent.click(screen.getByLabelText("Go to next page"));

  //expect the api url to contain start and end keywords that are used for pagination when we are moving to the next page
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&sort=name.asc)/);

  await act(async () => {
    apiHelper.resolve(
      Either.right({
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
      }),
    );
  });

  //sort on the second page
  const resourceIdButton = await screen.findByText("Name");

  expect(resourceIdButton).toBeVisible();

  await userEvent.click(resourceIdButton);

  // expect the api url to not contain start and end keywords that are used for pagination to assert we are back on the first page.
  // we are asserting on the second request as the first request is for the updated sorting event, and second is chained to back to the first page with still correct sorting
  expect(apiHelper.pendingRequests[1].url).not.toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[1].url).toMatch(/(&sort=name.desc)/);
});
