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
  MockStatusManager,
  Project,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Home } from "./Home";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
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
  const statusManager = new MockStatusManager();

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          statusManager,
        }}
      >
        <StoreProvider store={store}>
          <Home />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
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
