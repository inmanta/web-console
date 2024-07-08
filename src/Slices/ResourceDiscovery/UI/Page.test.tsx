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
import * as DiscoveredResources from "../Data/Mock";
import { DiscoveredResourcesPage } from ".";

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
            <DiscoveredResourcesPage />
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

test("GIVEN Discovered Resources page THEN shows table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/api/v2/discovered?limit=20&sort=discovered_resource_id.asc",
    environment: "env",
  });

  apiHelper.resolve(Either.right(DiscoveredResources.response));

  const rows = await screen.findAllByRole("row", {
    name: "DiscoveredResourceRow",
  });
  expect(rows).toHaveLength(17);
  expect(
    within(rows[0]).getByRole("cell", {
      name: "vcenter::VirtualMachine[lab,name=acisim]",
    }),
  ).toBeVisible();

  // with correct uri to managed resource
  const rowWithManagedResource = within(rows[0]).getByRole("cell", {
    name: "Show managed resource",
  });

  expect(rowWithManagedResource).toBeVisible();

  expect(within(rowWithManagedResource).getByRole("link")).toHaveAttribute(
    "href",
    "/resources/cloudflare%3A%3Adns_record%3A%3ACnameRecord%5Bhttps%3A%2F%2Fapi.cloudflare.com%2Fclient%2Fv4%2F%2Cname%3Dartifacts.ssh.inmanta.com%5D",
  );

  // uri is null
  expect(within(rows[1]).getByTestId("Managed resource")).toHaveTextContent("");

  // uri doesn't have a rid
  expect(within(rows[2]).getByTestId("Managed resource")).toHaveTextContent("");

  // uri is an empty string
  expect(within(rows[3]).getByTestId("Managed resource")).toHaveTextContent("");

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

test("GIVEN Discovered Resources page THEN sets sorting parameters correctly on click", async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(Either.right(DiscoveredResources.response));

  const resourceIdButton = await screen.findByRole("button", {
    name: words("discovered.column.resource_id"),
  });
  expect(resourceIdButton).toBeVisible();

  await act(async () => {
    await userEvent.click(resourceIdButton);
  });
  expect(apiHelper.pendingRequests[0].url).toContain(
    "&sort=discovered_resource_id.desc",
  );

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

test("GIVEN Discovered Resources WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
  const { component, apiHelper } = setup();
  render(component);

  //mock that response has more than one site
  await act(async () => {
    apiHelper.resolve(
      Either.right({
        ...DiscoveredResources.response,
        metadata: {
          total: 103,
          before: 0,
          after: 3,
          page_size: 100,
        },
        links: {
          ...DiscoveredResources.response.links,
          next: "/fake-link?end=fake-first-param",
        },
      }),
    );
  });

  expect(screen.getByLabelText("Go to next page")).toBeEnabled();

  await act(async () => {
    await userEvent.click(screen.getByLabelText("Go to next page"));
  });

  //expect the api url to contain start and end keywords that are used for pagination when we are moving to the next page
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[0].url).toMatch(
    /(&sort=discovered_resource_id.asc)/,
  );

  await act(async () => {
    apiHelper.resolve(Either.right(DiscoveredResources.response));
  });

  const resourceIdButton = await screen.findByRole("button", {
    name: words("discovered.column.resource_id"),
  });

  await act(async () => {
    await userEvent.click(resourceIdButton);
  });

  // expect the api url to not contain start and end keywords that are used for pagination to assert we are back on the first page.  //we are asserting on the second request as the first request is for the updated sorting event, and second is chained to back to the first page with still correct sorting
  expect(apiHelper.pendingRequests[1].url).not.toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[1].url).toMatch(
    /(&sort=discovered_resource_id.desc)/,
  );
});
