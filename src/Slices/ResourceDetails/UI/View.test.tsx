import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { Page } from "@patternfly/react-core";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { axe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import { getStoreInstance, QueryResolverImpl } from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolverImpl,
  StaticScheduler,
  Resource,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import {
  ResourceDetailsQueryManager,
  ResourceDetailsStateHelper,
} from "@S/ResourceDetails/Data";
import { ResourceDetails } from "@S/ResourceDetails/Data/Mock";
import { View } from "./View";

expect.extend(toHaveNoViolations);

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([
      ResourceDetailsQueryManager(
        apiHelper,
        ResourceDetailsStateHelper(store),
        scheduler,
      ),
    ]),
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
          <Page>
            <View id={Resource.id} />
          </Page>
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, scheduler, apiHelper };
}

test("GIVEN The Resource details view THEN details data is fetched immediately", async() => {
  const { component, apiHelper } = setup();

  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/resource/${Resource.encodedId}`,
  );

  await act(async() => {
    await apiHelper.resolve(Either.right({ data: ResourceDetails.a }));
  });

  expect(
    await screen.findByText(ResourceDetails.a.attributes.path),
  ).toBeVisible();

  await act(async() => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN The Resource details view WHEN the user clicks on the requires tab THEN the requires table is shown", async() => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async() => {
    await apiHelper.resolve(Either.right({ data: ResourceDetails.a }));
  });

  await userEvent.click(
    screen.getAllByRole("tab", {
      name: words("resources.requires.title"),
    })[0],
  );

  expect(apiHelper.resolvedRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests).toHaveLength(0);

  expect(
    await screen.findByRole("grid", { name: "ResourceRequires-Success" }),
  ).toBeVisible();

  await act(async() => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN The Resource details view THEN shows status label", async() => {
  const { component, apiHelper } = setup();

  render(component);
  await act(async() => {
    await apiHelper.resolve(Either.right({ data: ResourceDetails.a }));
  });

  expect(screen.getByTestId("Status-deployed")).toBeVisible();

  await act(async() => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});
