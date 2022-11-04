import React from "react";
import { Link, MemoryRouter, useLocation } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, RemoteData } from "@/Core";
import {
  QueryResolverImpl,
  ServicesQueryManager,
  ServicesStateHelper,
  getStoreInstance,
  DeleteServiceCommandManager,
  BaseApiHelper,
  CommandResolverImpl,
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
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
import { Page } from "./Page";

const [env1, env2] = Environment.filterable.map((env) => env.id);

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();

  const servicesHelper = ServicesQueryManager(
    apiHelper,
    ServicesStateHelper(store),
    scheduler
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([servicesHelper])
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

test("ServiceCatalog shows updated services", async () => {
  const { component, apiHelper, scheduler } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ServiceCatalog-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: [] }));

  expect(
    await screen.findByRole("generic", { name: "ServiceCatalog-Empty" })
  ).toBeInTheDocument();

  scheduler.executeAll();

  apiHelper.resolve(Either.right({ data: [Service.a] }));

  expect(
    await screen.findByRole("generic", { name: "ServiceCatalog-Success" })
  ).toBeInTheDocument();
});

test("ServiceCatalog shows updated empty", async () => {
  const { component, apiHelper, scheduler } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ServiceCatalog-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: [Service.a] }));

  expect(
    await screen.findByRole("generic", { name: "ServiceCatalog-Success" })
  ).toBeInTheDocument();

  scheduler.executeAll();

  apiHelper.resolve(Either.right({ data: [] }));

  expect(
    await screen.findByRole("generic", { name: "ServiceCatalog-Empty" })
  ).toBeInTheDocument();
});

test("GIVEN ServiceCatalog WHEN new environment selected THEN new query is triggered", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.resolvedRequests).toHaveLength(0);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/lsm/v1/service_catalog?instance_summary=True",
    environment: env1,
  });

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: [Service.a] }));
  });

  await userEvent.click(screen.getByText("change environment"));

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.resolvedRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/lsm/v1/service_catalog?instance_summary=True",
    environment: env2,
  });
});
