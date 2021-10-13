import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { MemoryRouter } from "react-router";
import {
  DeferredFetcher,
  DynamicQueryManagerResolver,
  StaticScheduler,
} from "@/Test";
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  getStoreInstance,
  ResourceHistoryQueryManager,
  ResourceHistoryStateHelper,
} from "@/Data";
import { UrlManagerImpl } from "@/UI/Utils";
import { ResourceHistoryView } from "./ResourceHistoryView";
import { ResourceHistory } from "@/Test/Data";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const resourceHistoryFetcher = new DeferredFetcher<"ResourceHistory">();
  const environment = "34a961ba-db3c-486e-8d85-1438d8e88909";
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ResourceHistoryQueryManager(
        resourceHistoryFetcher,
        new ResourceHistoryStateHelper(store),
        scheduler,
        environment
      ),
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          queryResolver,
          urlManager: new UrlManagerImpl("", environment),
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

  return { component, resourceHistoryFetcher, scheduler };
}

test("ResourceHistoryView shows empty table", async () => {
  const { component, resourceHistoryFetcher } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourceHistory-Loading" })
  ).toBeInTheDocument();

  resourceHistoryFetcher.resolve(
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
  const { component, resourceHistoryFetcher } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourceHistory-Loading" })
  ).toBeInTheDocument();

  resourceHistoryFetcher.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "ResourceHistory-Failed" })
  ).toBeInTheDocument();
});

test("ResourceHistory shows success table", async () => {
  const { component, resourceHistoryFetcher } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourceHistory-Loading" })
  ).toBeInTheDocument();

  resourceHistoryFetcher.resolve(Either.right(ResourceHistory.response));

  expect(
    await screen.findByRole("grid", { name: "ResourceHistory-Success" })
  ).toBeInTheDocument();
});

test("ResourceHistoryView shows sorting buttons for sortable columns", async () => {
  const { component, resourceHistoryFetcher } = setup();
  render(component);
  resourceHistoryFetcher.resolve(Either.right(ResourceHistory.response));
  expect(await screen.findByRole("button", { name: /Date/i })).toBeVisible();
});

test("ResourcesView sets sorting parameters correctly on click", async () => {
  const { component, resourceHistoryFetcher } = setup();
  render(component);
  resourceHistoryFetcher.resolve(Either.right(ResourceHistory.response));
  const stateButton = await screen.findByRole("button", { name: /date/i });
  expect(stateButton).toBeVisible();
  userEvent.click(stateButton);
  expect(resourceHistoryFetcher.getInvocations()[1][1]).toContain(
    "&sort=date.asc"
  );
});

test("GIVEN The Resources table WHEN the user clicks on the expansion toggle THEN the tabs are shown", async () => {
  const { component, resourceHistoryFetcher } = setup();

  render(component);

  await act(async () => {
    await resourceHistoryFetcher.resolve(
      Either.right(ResourceHistory.response)
    );
  });

  userEvent.click(screen.getAllByRole("button", { name: "Details" })[0]);
  expect(
    screen.getAllByRole("button", { name: "Desired State" })[0]
  ).toBeVisible();
  expect(screen.getAllByRole("button", { name: "Requires" })[0]).toBeVisible();
});
