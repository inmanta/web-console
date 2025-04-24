import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import { getStoreInstance, QueryResolverImpl } from "@/Data";
import {
  GetEnvironmentsContinuousQueryManager,
  GetEnvironmentsContinuousStateHelper,
} from "@/Data/Managers/GetEnvironmentsContinuous";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolverImpl,
  Project,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { Page } from "./Page";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const environmentsManager = GetEnvironmentsContinuousQueryManager(
    apiHelper,
    scheduler,
    GetEnvironmentsContinuousStateHelper(store)
  );
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([environmentsManager])
  );
  const component = (
    <TestMemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
        }}
      >
        <StoreProvider store={store}>
          <Page />
        </StoreProvider>
      </DependencyProvider>
    </TestMemoryRouter>
  );

  return { component, apiHelper };
}

test("Home view shows failed table", async () => {
  const { component, apiHelper } = setup();

  render(component);

  expect(await screen.findByRole("region", { name: "Overview-Loading" })).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(await screen.findByRole("region", { name: "Overview-Failed" })).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Home View shows success table", async () => {
  const { component, apiHelper } = setup();

  render(component);

  expect(await screen.findByRole("region", { name: "Overview-Loading" })).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: Project.filterable,
    })
  );

  expect(await screen.findByRole("generic", { name: "Overview-Success" })).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});
