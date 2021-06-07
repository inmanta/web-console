import React from "react";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  DeferredFetcher,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  InstantPoster,
  Service,
  StaticScheduler,
} from "@/Test";
import { ServiceCatalog } from "@/UI/Pages";
import { Either, RemoteData } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
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
  ServiceDeleter,
  BaseApiHelper,
} from "@/Data";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const servicesFetcher = new DeferredFetcher<"Services">();

  const servicesHelper = new ServicesQueryManager(
    servicesFetcher,
    new ServicesStateHelper(store, Service.a.environment),
    scheduler,
    Service.a.environment
  );
  const serviceConfigFetcher = new DeferredFetcher<"ServiceConfig">();
  const serviceConfigStateHelper = new ServiceConfigStateHelper(store);
  const serviceConfigQueryManager = new ServiceConfigQueryManager(
    serviceConfigFetcher,
    new ServiceConfigStateHelper(store),
    new ServiceConfigFinalizer(
      new ServiceStateHelper(
        store,
        new ServiceKeyMaker(),
        Service.a.environment
      )
    ),
    Service.a.environment
  );

  const serviceConfigCommandManager = new ServiceConfigCommandManager(
    new InstantPoster<"ServiceConfig">(
      RemoteData.success({ data: Service.a.config })
    ),
    serviceConfigStateHelper
  );
  const deleteServiceCommandManager = new DeleteServiceCommandManager(
    new ServiceDeleter(new BaseApiHelper(), Service.a.environment)
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
      <DependencyProvider dependencies={{ queryResolver, commandResolver }}>
        <StoreProvider store={store}>
          <ServiceCatalog />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    servicesFetcher,
    serviceConfigFetcher,
    scheduler,
  };
}

test("GIVEN ServiceCatalog WHEN click on config tab THEN shows config tab", async () => {
  const { component, servicesFetcher } = setup();
  render(component);

  servicesFetcher.resolve(Either.right({ data: [Service.a] }));

  const details = await screen.findByRole("button", {
    name: `${Service.a.name} Details`,
  });
  userEvent.click(details);

  const configButton = screen.getByRole("button", { name: "Config" });
  userEvent.click(configButton);

  expect(screen.getByRole("article", { name: "ServiceConfig" })).toBeVisible();
});

test("GIVEN ServiceCatalog WHEN config tab is active THEN shows SettingsList", async () => {
  const { component, servicesFetcher, serviceConfigFetcher } = setup();
  render(component);

  servicesFetcher.resolve(Either.right({ data: [Service.a] }));

  const details = await screen.findByRole("button", {
    name: `${Service.a.name} Details`,
  });
  userEvent.click(details);

  const configButton = screen.getByRole("button", { name: "Config" });
  userEvent.click(configButton);

  serviceConfigFetcher.resolve(Either.right({ data: {} }));

  expect(
    await screen.findByRole("generic", { name: "SettingsList" })
  ).toBeVisible();
});
