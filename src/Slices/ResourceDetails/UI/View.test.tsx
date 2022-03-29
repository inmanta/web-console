import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import { getStoreInstance, QueryResolverImpl } from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  StaticScheduler,
  Resource,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  ResourceDetailsQueryManager,
  ResourceDetailsStateHelper,
} from "@S/ResourceDetails/Data";
import { ResourceDetails } from "@S/ResourceDetails/Data/Mock";
import { View } from "./View";

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
          <View id={Resource.id} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, scheduler, apiHelper };
}

test("GIVEN The Resource details view THEN details data is fetched immediately", async () => {
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
  expect(apiHelper.pendingRequests).toHaveLength(0);

  expect(
    await screen.findByRole("grid", { name: "ResourceRequires-Success" })
  ).toBeVisible();
});

test("GIVEN The Resource details view THEN shows status label", async () => {
  const { component, apiHelper } = setup();
  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right({ data: ResourceDetails.a }));
  });

  expect(
    screen.getByRole("generic", { name: "Status-deployed" })
  ).toBeVisible();
});
