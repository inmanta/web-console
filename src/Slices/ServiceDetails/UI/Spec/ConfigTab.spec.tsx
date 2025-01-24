import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
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
import { defaultAuthContext } from "@/Data/Auth/AuthContext";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolverImpl,
  DynamicQueryManagerResolverImpl,
  MockEnvironmentHandler,
  MockEnvironmentModifier,
  Service,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Page } from "@S/ServiceDetails/UI/Page";

const server = setupServer();

function setup() {
  const client = new QueryClient();
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const serviceKeyMaker = new ServiceKeyMaker();

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

  const serviceConfigCommandManager = ServiceConfigCommandManager(
    apiHelper,
    ServiceConfigStateHelper(store),
  );

  const deleteServiceCommandManager = DeleteServiceCommandManager(
    BaseApiHelper(undefined, defaultAuthContext),
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([
      servicesHelper,
      serviceConfigQueryManager,
    ]),
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolverImpl([
      serviceConfigCommandManager,
      deleteServiceCommandManager,
    ]),
  );
  const component = (
    <QueryClientProvider client={client}>
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
    </QueryClientProvider>
  );

  return {
    component,
  };
}

beforeAll(() => {
  server.use(
    http.get("/lsm/v1/service_catalog/service_name_a", () => {
      return HttpResponse.json({ data: Service.a });
    }),
    http.get("/lsm/v1/service_catalog/service_name_a/config", () => {
      return HttpResponse.json({ data: { test: Service.a.config } });
    }),
  );
  server.listen();
});

afterAll(() => {
  server.close();
});

test("GIVEN ServiceCatalog WHEN click on config tab THEN shows config tab", async () => {
  const { component } = setup();

  render(component);

  const configButton = await screen.findByRole("tab", { name: "Config" });

  await userEvent.click(configButton);

  expect(screen.getByTestId("ServiceConfig")).toBeVisible();
});

test("GIVEN ServiceCatalog WHEN config tab is active THEN shows SettingsList", async () => {
  const { component } = setup();

  render(component);
  const configButton = await screen.findByRole("tab", { name: "Config" });

  await userEvent.click(configButton);

  expect(
    await screen.findByRole("generic", { name: "SettingsList" }),
  ).toBeVisible();
});
