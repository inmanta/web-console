import React from "react";
import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import { getStoreInstance, QueryResolverImpl } from "@/Data";
import { EnvironmentDetailsOneTimeQueryManager } from "@/Slices/Settings/Data/GetEnvironmentDetails";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  EnvironmentDetails,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { Page } from "./Page";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const environmentDetailsQueryManager = EnvironmentDetailsOneTimeQueryManager(
    store,
    apiHelper
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([environmentDetailsQueryManager])
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
          <Page />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper };
}

test("Home view shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "Dashboard-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "Dashboard-Failed" })
  ).toBeInTheDocument();
});

test("Home View shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "Dashboard-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: EnvironmentDetails.a,
    })
  );

  expect(
    await screen.findByText(words("dashboard.title")(EnvironmentDetails.a.name))
  ).toBeInTheDocument();
});
