import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  QueryManagerResolver,
} from "@/Data";
import { DeferredApiHelper, dependencies, StaticScheduler } from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { Mock } from "@S/Facts/Test";
import { Page } from "./Page";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler),
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <StoreProvider store={store}>
          <Page />
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
  await act(async () => {
    await userEvent.click(resourceIdButton);
  });
  expect(apiHelper.pendingRequests[0].url).toContain("&sort=resource_id.asc");
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
    await act(async () => {
      await userEvent.click(input);
    });

    await act(async () => {
      await userEvent.type(input, `${filterValue}{enter}`);
    });

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
  },
);
