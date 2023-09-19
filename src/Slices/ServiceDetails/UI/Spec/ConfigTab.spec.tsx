import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
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
  ServiceQueryManager,
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
import { Page } from "@S/ServiceDetails/UI/Page";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const serviceKeyMaker = new ServiceKeyMaker();

  const serviceQueryManager = ServiceQueryManager(
    apiHelper,
    ServiceStateHelper(store, serviceKeyMaker),
    scheduler,
    serviceKeyMaker,
  );

  const servicesHelper = ServicesQueryManager(
    apiHelper,
    ServicesStateHelper(store),
    scheduler,
  );
  const serviceConfigQueryManager = ServiceConfigQueryManager(
    apiHelper,
    ServiceConfigStateHelper(store),
    new ServiceConfigFinalizer(ServiceStateHelper(store, serviceKeyMaker)),
  );

  // { data: Service.a.config }
  const serviceConfigCommandManager = ServiceConfigCommandManager(
    apiHelper,
    ServiceConfigStateHelper(store),
  );

  const deleteServiceCommandManager = DeleteServiceCommandManager(
    new BaseApiHelper(),
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      serviceQueryManager,
      servicesHelper,
      serviceConfigQueryManager,
    ]),
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      serviceConfigCommandManager,
      deleteServiceCommandManager,
    ]),
  );
  const component = (
    <MemoryRouter initialEntries={[`/lsm/catalog/${Service.a.name}/details`]}>
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
          <Routes>
            <Route path="/lsm/catalog/:service/details" element={<Page />} />
          </Routes>
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

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: Service.a }));
  });

  const configButton = screen.getByRole("tab", { name: "Config" });

  await act(async () => {
    await userEvent.click(configButton);
  });

  expect(screen.getByTestId("ServiceConfig")).toBeVisible();
});

test("GIVEN ServiceCatalog WHEN config tab is active THEN shows SettingsList", async () => {
  const { component, apiHelper } = setup();
  render(component);
  await act(async () => {
    apiHelper.resolve(Either.right({ data: Service.a }));
  });

  const configButton = screen.getByRole("tab", { name: "Config" });
  await act(async () => {
    await userEvent.click(configButton);
  });

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: {} }));
  });

  expect(
    await screen.findByRole("generic", { name: "SettingsList" }),
  ).toBeVisible();
});
