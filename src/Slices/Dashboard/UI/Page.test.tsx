import React from "react";
import { MemoryRouter } from "react-router";
import { act, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import { getStoreInstance, QueryResolverImpl } from "@/Data";
import { GetMetricsQueryManager } from "@/Data/Managers/GetMetrics";
import { GetMetricsStateHelper } from "@/Data/Managers/GetMetrics/StateHelper";
import { EnvironmentDetailsOneTimeQueryManager } from "@/Slices/Settings/Data/GetEnvironmentDetails";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolverImpl,
  EnvironmentDetails,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
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
  const environmentDetailsQueryManager = EnvironmentDetailsOneTimeQueryManager(
    store,
    apiHelper,
  );
  const metricsQueryManager = GetMetricsQueryManager(
    apiHelper,
    GetMetricsStateHelper(store),
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([
      environmentDetailsQueryManager,
      metricsQueryManager,
    ]),
  );
  const component = (
    <MemoryRouter>
      <StoreProvider store={store}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            queryResolver,
          }}
        >
          <Page />
        </DependencyProvider>
      </StoreProvider>
    </MemoryRouter>
  );

  return { component, apiHelper };
}

test("Home view shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("region", { name: "Dashboard-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("region", { name: "Dashboard-Failed" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

test("Home View shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("region", { name: "Dashboard-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: EnvironmentDetails.a,
    }),
  );
  expect(
    await screen.findByText(
      words("dashboard.title")(EnvironmentDetails.a.name),
    ),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
