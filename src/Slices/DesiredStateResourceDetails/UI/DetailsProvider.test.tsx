import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { act } from "react-dom/test-utils";
import { Either } from "@/Core";
import {
  getStoreInstance,
  QueryManagerResolverImpl,
  QueryResolverImpl,
} from "@/Data";
import { DeferredApiHelper, dependencies, StaticScheduler } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import * as VersionedResourceDetails from "@S/DesiredStateResourceDetails/Data/Mock";
import { DetailsProvider } from "./DetailsProvider";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <StoreProvider store={store}>
          <DetailsProvider version="123" resourceId="abc" />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("GIVEN DesiredStateResourceDetails page WHEN api returns details THEN shows details", async () => {
  const { component, apiHelper } = setup();
  render(component);
  expect(apiHelper.pendingRequests).toEqual([
    {
      method: "GET",
      url: `/api/v2/desiredstate/123/resource/abc`,
      environment: "env",
    },
  ]);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: VersionedResourceDetails.a }));
  });

  expect(
    screen.getByRole("generic", { name: "ResourceDetails-Success" }),
  ).toBeVisible();
  expect(screen.getByText("requires")).toBeVisible();
});
