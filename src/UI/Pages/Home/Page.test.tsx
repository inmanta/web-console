import React from "react";
import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  CommandResolverImpl,
  DeleteEnvironmentCommandManager,
  getStoreInstance,
  QueryResolverImpl,
  GetEnvironmentsStateHelper,
  GetEnvironmentsQueryManager,
  EnvironmentsUpdater,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  Project,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Page } from "./Page";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const environmentsStateHelper = new GetEnvironmentsStateHelper(store);
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new GetEnvironmentsQueryManager(apiHelper, environmentsStateHelper),
    ])
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new DeleteEnvironmentCommandManager(
        apiHelper,
        new EnvironmentsUpdater(environmentsStateHelper, apiHelper)
      ),
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
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
    await screen.findByRole("generic", { name: "Overview-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "Overview-Failed" })
  ).toBeInTheDocument();
});

test("Home View shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "Overview-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: Project.filterable,
    })
  );

  expect(
    await screen.findByRole("generic", { name: "Overview-Success" })
  ).toBeInTheDocument();
});
