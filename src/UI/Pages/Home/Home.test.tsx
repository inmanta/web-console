import React from "react";
import { MemoryRouter } from "react-router";
import { StoreProvider } from "easy-peasy";
import { render, screen } from "@testing-library/react";
import {
  CommandResolverImpl,
  DeleteEnvironmentCommandManager,
  getStoreInstance,
  ProjectsQueryManager,
  ProjectsStateHelper,
  ProjectsUpdater,
  QueryResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  DeferredFetcher,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  MockFeatureManger,
  Project,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Home } from "./Home";
import { Either } from "@/Core";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const projectsFetcher = new DeferredFetcher<"GetProjects">();
  const projectsStateHelper = new ProjectsStateHelper(store);
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ProjectsQueryManager(projectsFetcher, projectsStateHelper),
    ])
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new DeleteEnvironmentCommandManager(
        apiHelper,
        new ProjectsUpdater(projectsStateHelper, projectsFetcher)
      ),
    ])
  );
  const featureManager = new MockFeatureManger();

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{ queryResolver, commandResolver, featureManager }}
      >
        <StoreProvider store={store}>
          <Home />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, projectsFetcher, scheduler };
}

test("Home view shows failed table", async () => {
  const { component, projectsFetcher } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "Overview-Loading" })
  ).toBeInTheDocument();

  projectsFetcher.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "Overview-Failed" })
  ).toBeInTheDocument();
});

test("Home View shows success table", async () => {
  const { component, projectsFetcher } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "Overview-Loading" })
  ).toBeInTheDocument();

  projectsFetcher.resolve(
    Either.right({
      data: Project.filterable,
    })
  );

  expect(
    await screen.findByRole("generic", { name: "Overview-Success" })
  ).toBeInTheDocument();
});
