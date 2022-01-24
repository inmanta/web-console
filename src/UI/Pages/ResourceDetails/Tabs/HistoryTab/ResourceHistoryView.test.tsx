import React from "react";
import { MemoryRouter } from "react-router";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  ResourceHistoryQueryManager,
  ResourceHistoryStateHelper,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  StaticScheduler,
} from "@/Test";
import { ResourceHistory } from "@/Test/Data";
import { DependencyProvider } from "@/UI/Dependency";
import { ResourceHistoryView } from "./ResourceHistoryView";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ResourceHistoryQueryManager(
        apiHelper,
        new ResourceHistoryStateHelper(store),
        scheduler
      ),
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
        }}
      >
        <StoreProvider store={store}>
          <ResourceHistoryView
            resourceId={ResourceHistory.response.data[0].resource_id}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("ResourceHistoryView shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourceHistory-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [],
      metadata: { total: 0, before: 0, after: 0, page_size: 10 },
      links: { self: "" },
    })
  );

  expect(
    await screen.findByRole("generic", { name: "ResourceHistory-Empty" })
  ).toBeInTheDocument();
});

test("ResourceHistoryView shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourceHistory-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "ResourceHistory-Failed" })
  ).toBeInTheDocument();
});

test("ResourceHistory shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourceHistory-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right(ResourceHistory.response));

  expect(
    await screen.findByRole("grid", { name: "ResourceHistory-Success" })
  ).toBeInTheDocument();
});

test("ResourceHistoryView shows sorting buttons for sortable columns", async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(Either.right(ResourceHistory.response));
  expect(await screen.findByRole("button", { name: /Date/i })).toBeVisible();
});

test("ResourcesView sets sorting parameters correctly on click", async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(Either.right(ResourceHistory.response));
  const stateButton = await screen.findByRole("button", { name: /date/i });
  expect(stateButton).toBeVisible();
  userEvent.click(stateButton);
  expect(apiHelper.pendingRequests[0].url).toContain("&sort=date.asc");
});

test("GIVEN The Resources table WHEN the user clicks on the expansion toggle THEN the tabs are shown", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(ResourceHistory.response));
  });

  userEvent.click(screen.getAllByRole("button", { name: "Details" })[0]);
  expect(
    screen.getAllByRole("button", { name: "Desired State" })[0]
  ).toBeVisible();
  expect(screen.getAllByRole("button", { name: "Requires" })[0]).toBeVisible();
});
