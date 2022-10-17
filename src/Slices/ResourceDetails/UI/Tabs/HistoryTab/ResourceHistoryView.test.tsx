import React from "react";
import { MemoryRouter } from "react-router";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, RemoteData } from "@/Core";
import { QueryResolverImpl, getStoreInstance } from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  StaticScheduler,
} from "@/Test";
import { Resource } from "@/Test/Data";
import { DependencyProvider } from "@/UI/Dependency";
import {
  ResourceDetailsQueryManager,
  ResourceDetailsStateHelper,
  ResourceHistoryQueryManager,
  ResourceHistoryStateHelper,
} from "@S/ResourceDetails/Data";
import { ResourceHistory } from "@S/ResourceDetails/Data/Mock";
import { ResourceHistoryView } from "./ResourceHistoryView";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      ResourceHistoryQueryManager(
        apiHelper,
        ResourceHistoryStateHelper(store),
        scheduler
      ),
      ResourceDetailsQueryManager(
        apiHelper,
        ResourceDetailsStateHelper(store),
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
            resourceId={Resource.id}
            details={RemoteData.notAsked()}
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

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    environment: "env",
    url: `/api/v2/resource/${Resource.encodedId}/history?limit=20&sort=date.desc`,
    method: "GET",
  });

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
  await userEvent.click(stateButton);
  expect(apiHelper.pendingRequests[0].url).toContain("&sort=date.asc");
});

test("GIVEN The Resources table WHEN the user clicks on the expansion toggle THEN the tabs are shown", async () => {
  const { component, apiHelper } = setup();
  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right(ResourceHistory.response));
  });
  await userEvent.click(screen.getAllByRole("button", { name: "Details" })[0]);
  expect(
    screen.getAllByRole("tab", { name: "Desired State" })[0]
  ).toBeVisible();
  expect(screen.getAllByRole("tab", { name: "Requires" })[0]).toBeVisible();
});
