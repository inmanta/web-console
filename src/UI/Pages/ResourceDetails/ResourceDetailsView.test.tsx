import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  getStoreInstance,
  QueryResolverImpl,
  ResourceDetailsQueryManager,
  ResourceDetailsStateHelper,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  ResourceDetails,
  StaticScheduler,
  Resource,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ResourceDetailsView } from "./ResourceDetailsView";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ResourceDetailsQueryManager(
        apiHelper,
        new ResourceDetailsStateHelper(store),
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
          <ResourceDetailsView resourceId={Resource.id} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, scheduler, apiHelper };
}

test("GIVEN The Resource details view THEN desired state data is fetched immediately", async () => {
  const { component, apiHelper } = setup();

  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/resource/${Resource.encodedId}`
  );

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: ResourceDetails.a }));
  });

  expect(
    await screen.findByText(ResourceDetails.a.attributes.path)
  ).toBeVisible();
});

test("GIVEN The Resource details view WHEN the user clicks on the requires tab THEN the requires table is shown", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: ResourceDetails.a }));
  });

  userEvent.click(screen.getAllByRole("button", { name: "Requires" })[0]);

  expect(apiHelper.resolvedRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/resource/${Resource.encodedId}`
  );

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: ResourceDetails.a }));
  });

  expect(
    await screen.findByRole("grid", { name: "ResourceRequires-Success" })
  ).toBeVisible();
});
