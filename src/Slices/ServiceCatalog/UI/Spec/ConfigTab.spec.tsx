import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  ServicesQueryManager,
  ServicesStateHelper,
  ServiceConfigQueryManager,
  ServiceConfigStateHelper,
  ServiceStateHelper,
  ServiceKeyMaker,
  ServiceConfigCommandManager,
  ServiceConfigFinalizer,
  CommandResolverImpl,
  getStoreInstance,
  DeleteServiceCommandManager,
  BaseApiHelper,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  MockEnvironmentHandler,
  MockEnvironmentModifier,
  Service,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Page } from "@S/ServiceCatalog/UI/Page";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();

  const servicesHelper = ServicesQueryManager(
    apiHelper,
    ServicesStateHelper(store),
    scheduler
  );
  const serviceConfigStateHelper = ServiceConfigStateHelper(store);
  const serviceConfigQueryManager = ServiceConfigQueryManager(
    apiHelper,
    ServiceConfigStateHelper(store),
    new ServiceConfigFinalizer(ServiceStateHelper(store, new ServiceKeyMaker()))
  );

  // { data: Service.a.config }
  const serviceConfigCommandManager = ServiceConfigCommandManager(
    apiHelper,
    serviceConfigStateHelper
  );

  const deleteServiceCommandManager = DeleteServiceCommandManager(
    new BaseApiHelper()
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([servicesHelper, serviceConfigQueryManager])
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      serviceConfigCommandManager,
      deleteServiceCommandManager,
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          environmentModifier: new MockEnvironmentModifier(),
          environmentHandler: MockEnvironmentHandler(Service.a.environment),
        }}
      >
        <StoreProvider store={store}>
          <Page />
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

test("GIVEN ServiceCatalog WHEN click on config tab THEN shows config tab", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(Either.right({ data: [Service.a] }));

  const details = await screen.findByRole("button", {
    name: `${Service.a.name} Details`,
  });
  await userEvent.click(details);

  const configButton = screen.getByRole("tab", { name: "Config" });
  await userEvent.click(configButton);

  expect(screen.getByRole("article", { name: "ServiceConfig" })).toBeVisible();
});

test("GIVEN ServiceCatalog WHEN config tab is active THEN shows SettingsList", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(Either.right({ data: [Service.a] }));

  const details = await screen.findByRole("button", {
    name: `${Service.a.name} Details`,
  });
  await userEvent.click(details);

  const configButton = screen.getByRole("tab", { name: "Config" });
  await act(async () => {
    await userEvent.click(configButton);
  });

  apiHelper.resolve(Either.right({ data: {} }));

  expect(
    await screen.findByRole("generic", { name: "SettingsList" })
  ).toBeVisible();
});
