import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { MemoryRouter } from "react-router-dom";
import { Either } from "@/Core";
import {
  getStoreInstance,
  QueryResolverImpl,
  ResourceDetailsQueryManager,
  ResourceDetailsStateHelper,
} from "@/Data";
import {
  DeferredFetcher,
  DynamicQueryManagerResolver,
  ResourceDetails,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { UrlManagerImpl } from "@/UI/Utils";
import { ResourceDetailsView } from "./ResourceDetailsView";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const resourceDetailsFetcher = new DeferredFetcher<"ResourceDetails">();
  const environment = "34a961ba-db3c-486e-8d85-1438d8e88909";
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ResourceDetailsQueryManager(
        resourceDetailsFetcher,
        new ResourceDetailsStateHelper(store),
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
          <ResourceDetailsView resourceId="std::File[agent2,path=/tmp/file4]" />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, scheduler, resourceDetailsFetcher };
}

test("GIVEN The Resource details view WHEN the user clicks on the info tab THEN data is fetched immediately", async () => {
  const { component, resourceDetailsFetcher } = setup();

  render(component);

  userEvent.click(screen.getAllByRole("button", { name: "Info" })[0]);

  expect(resourceDetailsFetcher.getInvocations()).toHaveLength(1);
  expect(resourceDetailsFetcher.getInvocations()[0][1]).toEqual(
    "/api/v2/resource/std::File[agent2,path=/tmp/file4]"
  );

  await act(async () => {
    await resourceDetailsFetcher.resolve(
      Either.right({ data: ResourceDetails.a })
    );
  });

  expect(
    await screen.findByText("std::File[agent2,path=/tmp/file4]")
  ).toBeVisible();
});

test("GIVEN The Resource details view WHEN the user clicks on the requires tab THEN the requires table is shown", async () => {
  const { component, resourceDetailsFetcher } = setup();

  render(component);

  userEvent.click(screen.getAllByRole("button", { name: "Info" })[0]);
  userEvent.click(screen.getAllByRole("button", { name: "Requires" })[0]);

  expect(resourceDetailsFetcher.getInvocations()).toHaveLength(2);
  expect(resourceDetailsFetcher.getInvocations()[1][1]).toEqual(
    "/api/v2/resource/std::File[agent2,path=/tmp/file4]"
  );

  await act(async () => {
    await resourceDetailsFetcher.resolve(
      Either.right({ data: ResourceDetails.a })
    );
  });

  expect(
    await screen.findByRole("grid", { name: "ResourceRequires-Success" })
  ).toBeVisible();
});
