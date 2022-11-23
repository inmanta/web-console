import React from "react";
import { Link, MemoryRouter, useLocation } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { act } from "react-dom/test-utils";
import { Either, RemoteData } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  DeleteServiceCommandManager,
  BaseApiHelper,
  CommandResolverImpl,
  ServiceQueryManager,
  ServiceStateHelper,
  ServiceKeyMaker,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  Environment,
  Service,
  StaticScheduler,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
import { Page } from "./Page";

const [env1, env2] = Environment.filterable.map((env) => env.id);

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const serviceKeyMaker = new ServiceKeyMaker();

  const serviceQueryManager = ServiceQueryManager(
    apiHelper,
    ServiceStateHelper(store, serviceKeyMaker),
    scheduler,
    serviceKeyMaker
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([serviceQueryManager])
  );
  const commandManager = DeleteServiceCommandManager(new BaseApiHelper());
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([commandManager])
  );

  const environmentHandler = EnvironmentHandlerImpl(
    useLocation,
    dependencies.routeManager
  );

  store.dispatch.environment.setEnvironments(
    RemoteData.success(Environment.filterable)
  );

  const linkToEnv2 = (
    <Link to={{ pathname: "/lsm/catalog", search: `?env=${env2}` }}>
      <button>change environment</button>
    </Link>
  );

  const component = (
    <MemoryRouter
      initialEntries={[{ pathname: "/lsm/catalog", search: `?env=${env1}` }]}
    >
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          environmentHandler,
        }}
      >
        <StoreProvider store={store}>
          <Page />
          {linkToEnv2}
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    apiHelper,
    scheduler,
  };
}
test("ServiceDetails removes service after deletion", async () => {
  const { component, apiHelper, scheduler } = setup();
  render(component);
  await act(async () => {
    await apiHelper.resolve(Either.right({ data: Service.a }));
  });

  expect(
    await screen.findByText(`Service Details: ${Service.a.name}`)
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: words("delete") }));

  fireEvent.click(screen.getByRole("button", { name: words("yes") }));

  scheduler.executeAll();

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: [] }));
  });

  expect(
    await screen.findByText(`Service Details: undefined`)
  ).toBeInTheDocument();
});
